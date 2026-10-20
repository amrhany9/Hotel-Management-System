export const RECORD_SEPARATOR = '\x1e';

export enum MessageType {
  Invocation = 1,
  StreamItem = 2,
  Completion = 3,
  StreamInvocation = 4,
  CancelInvocation = 5,
  Ping = 6,
  Close = 7,
}

export interface HubMessage {
  type?: MessageType;
  invocationId?: string;
  target?: string;
  arguments?: unknown[];
  error?: string;
  allowReconnect?: boolean;
}

export interface HandshakeRequest {
  protocol: string;
  version: number;
}

export interface NegotiateResponse {
  negotiateVersion: number;
  connectionId: string;
  connectionToken: string;
  availableTransports: Array<{ transport: string; transferFormats: string[] }>;
}

export function encodeMessage(message: object): string {
  return JSON.stringify(message) + RECORD_SEPARATOR;
}

export function splitRecords(buffer: string): { records: string[]; remainder: string } {
  const parts = buffer.split(RECORD_SEPARATOR);
  const remainder = parts.pop() ?? '';
  return { records: parts.filter((part) => part.length > 0), remainder };
}

export function parseHandshake(record: string): HandshakeRequest | null {
  try {
    const value = JSON.parse(record) as Partial<HandshakeRequest>;
    if (typeof value.protocol !== 'string' || typeof value.version !== 'number') return null;
    return { protocol: value.protocol, version: value.version };
  } catch {
    return null;
  }
}

export function parseHubMessage(record: string): HubMessage | null {
  try {
    const value = JSON.parse(record) as HubMessage;
    return typeof value === 'object' && value !== null && typeof value.type === 'number' ? value : null;
  } catch {
    return null;
  }
}

export const invocation = (target: string, args: unknown[]): HubMessage => ({
  type: MessageType.Invocation,
  target,
  arguments: args,
});

export const ping = (): HubMessage => ({ type: MessageType.Ping });

export const completionError = (invocationId: string, error: string): HubMessage => ({
  type: MessageType.Completion,
  invocationId,
  error,
});

export const close = (error?: string, allowReconnect?: boolean): HubMessage => ({
  type: MessageType.Close,
  ...(error ? { error } : {}),
  ...(allowReconnect !== undefined ? { allowReconnect } : {}),
});
