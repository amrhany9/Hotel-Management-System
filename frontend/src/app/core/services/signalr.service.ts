import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { Reservation, Room } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  private hubConnection: signalR.HubConnection | null = null;

  public reservationCreated$ = new Subject<Reservation>();
  public reservationCancelled$ = new Subject<number>();
  public roomCreated$ = new Subject<Room>();
  public roomUpdated$ = new Subject<Room>();
  public roomDeleted$ = new Subject<number>();

  public isConnected = false;

  async startConnection(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(API_ENDPOINTS.hubs.reservations, {
        accessTokenFactory: () => this.authService.getToken() || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.registerHandlers();

    try {
      await this.hubConnection.start();
      this.isConnected = true;
      console.log('[SignalR] Connected to hotel hub successfully.');
    } catch (err) {
      console.error('[SignalR] Connection error:', err);
      this.isConnected = false;
    }

    this.hubConnection.onclose(() => {
      this.isConnected = false;
      console.warn('[SignalR] Connection closed.');
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected = true;
      console.log('[SignalR] Connection re-established.');
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
      this.isConnected = false;
    }
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('reservationCreated', (reservation: Reservation) => {
      console.log('[SignalR] Received reservationCreated:', reservation);
      const currentUserId = this.authService.currentUser()?.userId;
      const isOtherUser = reservation.createdBy !== currentUserId;

      if (isOtherUser) {
        this.notificationService.info(
          `Another user created a reservation for ${reservation.guestName} (Room ${reservation.roomNumber})`,
          'New Reservation'
        );
      } else {
        this.notificationService.success(
          `Reservation confirmed for ${reservation.guestName} (Room ${reservation.roomNumber})`,
          'Reservation Created'
        );
      }

      this.reservationCreated$.next(reservation);
    });

    this.hubConnection.on('reservationCancelled', (reservationId: number) => {
      console.log('[SignalR] Received reservationCancelled:', reservationId);
      this.notificationService.warning(
        `Reservation #${reservationId} was cancelled.`,
        'Reservation Cancelled'
      );
      this.reservationCancelled$.next(reservationId);
    });

    this.hubConnection.on('roomCreated', (room: Room) => {
      console.log('[SignalR] Received roomCreated:', room);
      this.notificationService.info(
        `Room ${room.roomNumber} (${room.roomType}) was added.`,
        'Room Created'
      );
      this.roomCreated$.next(room);
    });

    this.hubConnection.on('roomUpdated', (room: Room) => {
      console.log('[SignalR] Received roomUpdated:', room);
      this.notificationService.info(
        `Room ${room.roomNumber} was updated.`,
        'Room Updated'
      );
      this.roomUpdated$.next(room);
    });

    this.hubConnection.on('roomDeleted', (roomId: number) => {
      console.log('[SignalR] Received roomDeleted:', roomId);
      this.notificationService.warning(
        `Room #${roomId} was deleted.`,
        'Room Deleted'
      );
      this.roomDeleted$.next(roomId);
    });
  }
}
