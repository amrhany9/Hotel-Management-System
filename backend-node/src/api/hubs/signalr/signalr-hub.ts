import { Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import {
  close,
  completionError,
  encodeMessage,
  HubMessage,
  invocation,
  MessageType,
  NegotiateResponse,
  parseHandshake,
  parseHubMessage,
  ping,
  splitRecords,
} from './signalr-protocol';

export interface SignalRHubOptions<TUser> {
  path: string;
  authenticate: (accessToken: string | null) => Promise<TUser | null>;
  isSameUser: (a: TUser, b: TUser) => boolean;
  describeUser?: (user: TUser) => string;
  keepAliveIntervalMs?: number;
  clientTimeoutMs?: number;
  handshakeTimeoutMs?: number;
  negotiationTtlMs?: number;
}

interface PendingNegotiation<TUser> {
  connectionId: string;
  user: TUser;
  expiresAt: number;
}

interface HubConnection<TUser> {
  connectionId: string;
  user: TUser;
  socket: WebSocket;
  buffer: string;
  handshakeCompleted: boolean;
  lastMessageAt: number;
}

const newId = (bytes: number): string => randomBytes(bytes).toString('base64url');

export class SignalRHub<TUser> {
  private readonly logger: Logger;
  private readonly wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
  private readonly pending = new Map<string, PendingNegotiation<TUser>>();
  private readonly connections = new Map<string, HubConnection<TUser>>();
  private readonly keepAliveIntervalMs: number;
  private readonly clientTimeoutMs: number;
  private readonly handshakeTimeoutMs: number;
  private readonly negotiationTtlMs: number;
  private keepAliveTimer?: NodeJS.Timeout;
  private server?: Server;

  constructor(private readonly options: SignalRHubOptions<TUser>) {
    this.logger = new Logger(`SignalRHub(${options.path})`);
    this.keepAliveIntervalMs = options.keepAliveIntervalMs ?? 15_000;
    this.clientTimeoutMs = options.clientTimeoutMs ?? 30_000;
    this.handshakeTimeoutMs = options.handshakeTimeoutMs ?? 15_000;
    this.negotiationTtlMs = options.negotiationTtlMs ?? 30_000;
  }

  get connectionCount(): number {
    return this.connections.size;
  }

  negotiate(user: TUser): NegotiateResponse {
    const connectionId = newId(16);
    const connectionToken = newId(24);
    this.pending.set(connectionToken, { connectionId, user, expiresAt: Date.now() + this.negotiationTtlMs });
    return {
      negotiateVersion: 1,
      connectionId,
      connectionToken,
      availableTransports: [{ transport: 'WebSockets', transferFormats: ['Text'] }],
    };
  }

  attach(server: Server): void {
    this.server = server;
    server.on('upgrade', this.onUpgrade);
    this.keepAliveTimer = setInterval(() => this.keepAlive(), this.keepAliveIntervalMs);
    this.keepAliveTimer.unref();
  }

  broadcast(target: string, ...args: unknown[]): void {
    const payload = encodeMessage(invocation(target, args));
    for (const connection of this.connections.values()) {
      if (connection.handshakeCompleted && connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(payload);
      }
    }
  }

  shutdown(): void {
    clearInterval(this.keepAliveTimer);
    this.server?.off('upgrade', this.onUpgrade);
    for (const connection of this.connections.values()) {
      this.send(connection, close('Server is shutting down.', true));
      connection.socket.close(1001);
    }
    this.connections.clear();
    this.pending.clear();
    this.wss.close();
  }

  private readonly onUpgrade = (request: IncomingMessage, socket: Duplex, head: Buffer): void => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.pathname.replace(/\/+$/, '') !== this.options.path) return;

    void this.acceptUpgrade(url, request, socket, head).catch((error: Error) => {
      this.logger.error(`WebSocket upgrade failed: ${error.message}`);
      this.rejectUpgrade(socket, 500, 'Internal Server Error');
    });
  };

  private async acceptUpgrade(url: URL, request: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    const connectionToken = url.searchParams.get('id');
    const negotiation = connectionToken ? this.pending.get(connectionToken) : undefined;
    if (!connectionToken || !negotiation || negotiation.expiresAt < Date.now()) {
      this.rejectUpgrade(socket, 404, 'Not Found');
      return;
    }

    const user = await this.options.authenticate(this.extractAccessToken(url, request));
    if (!user || !this.options.isSameUser(user, negotiation.user)) {
      this.rejectUpgrade(socket, 401, 'Unauthorized');
      return;
    }

    this.pending.delete(connectionToken);
    this.wss.handleUpgrade(request, socket, head, (ws) => this.onConnection(ws, negotiation.connectionId, user));
  }

  private extractAccessToken(url: URL, request: IncomingMessage): string | null {
    const fromQuery = url.searchParams.get('access_token');
    if (fromQuery) return fromQuery;
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }

  private rejectUpgrade(socket: Duplex, status: number, reason: string): void {
    if (socket.writable) {
      socket.write(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
    }
    socket.destroy();
  }

  private onConnection(socket: WebSocket, connectionId: string, user: TUser): void {
    const connection: HubConnection<TUser> = {
      connectionId,
      user,
      socket,
      buffer: '',
      handshakeCompleted: false,
      lastMessageAt: Date.now(),
    };
    this.connections.set(connectionId, connection);

    const handshakeTimer = setTimeout(() => {
      if (!connection.handshakeCompleted) socket.close(1002, 'Handshake timeout');
    }, this.handshakeTimeoutMs);

    socket.on('message', (data: RawData, isBinary: boolean) => {
      if (isBinary) {
        socket.close(1003, 'Binary messages are not supported');
        return;
      }
      connection.lastMessageAt = Date.now();
      this.onData(connection, data.toString());
    });

    socket.on('close', () => {
      clearTimeout(handshakeTimer);
      this.connections.delete(connectionId);
      this.logger.log(`Client disconnected: ${connectionId}`);
    });

    socket.on('error', (error) => this.logger.warn(`Socket error on ${connectionId}: ${error.message}`));
  }

  private onData(connection: HubConnection<TUser>, chunk: string): void {
    const { records, remainder } = splitRecords(connection.buffer + chunk);
    connection.buffer = remainder;

    for (const record of records) {
      if (!connection.handshakeCompleted) {
        this.completeHandshake(connection, record);
        continue;
      }
      const message = parseHubMessage(record);
      if (message) this.onHubMessage(connection, message);
    }
  }

  private completeHandshake(connection: HubConnection<TUser>, record: string): void {
    const handshake = parseHandshake(record);
    if (!handshake || handshake.protocol !== 'json' || handshake.version !== 1) {
      const requested = handshake ? `${handshake.protocol} v${handshake.version}` : 'unknown';
      this.send(connection, { error: `Requested protocol '${requested}' is not available.` });
      connection.socket.close(1002, 'Unsupported protocol');
      return;
    }

    connection.handshakeCompleted = true;
    this.send(connection, {});
    const who = this.options.describeUser?.(connection.user) ?? 'Anonymous';
    this.logger.log(`Client connected: ${connection.connectionId}, User: ${who}`);
  }

  private onHubMessage(connection: HubConnection<TUser>, message: HubMessage): void {
    switch (message.type) {
      case MessageType.Ping:
        return;
      case MessageType.Close:
        connection.socket.close(1000);
        return;
      case MessageType.Invocation:
      case MessageType.StreamInvocation:
        if (message.invocationId) {
          this.send(connection, completionError(message.invocationId, `Method '${message.target}' does not exist.`));
        }
        return;
      default:
        return;
    }
  }

  private keepAlive(): void {
    const now = Date.now();
    for (const [token, negotiation] of this.pending) {
      if (negotiation.expiresAt < now) this.pending.delete(token);
    }
    for (const connection of this.connections.values()) {
      if (now - connection.lastMessageAt > this.clientTimeoutMs) {
        this.send(connection, close('Server timeout elapsed without receiving a message from the client.', true));
        connection.socket.close(1000);
        continue;
      }
      if (connection.handshakeCompleted) this.send(connection, ping());
    }
  }

  private send(connection: HubConnection<TUser>, message: object): void {
    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(encodeMessage(message));
    }
  }
}
