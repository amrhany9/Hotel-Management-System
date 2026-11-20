import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { TranslationService } from './translation.service';
import { Reservation, ReservationUpdatedEvent, Room } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private translation = inject(TranslationService);

  private hubConnection: signalR.HubConnection | null = null;

  public reservationCreated$ = new Subject<Reservation>();
  public reservationUpdated$ = new Subject<ReservationUpdatedEvent>();
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

    const t = (key: string, params?: Record<string, string | number>) => this.translation.translate(key, params);

    this.hubConnection.on('reservationCreated', (reservation: Reservation) => {
      const message = t('toast.guestRoom', { guest: reservation.guestName, room: reservation.roomNumber });
      if (reservation.createdBy !== this.authService.currentUser()?.userId) {
        this.notificationService.info(message, t('toast.newReservation'));
      } else {
        this.notificationService.success(message, t('toast.reservationCreated'));
      }
      this.reservationCreated$.next(reservation);
    });

    this.hubConnection.on('reservationUpdated', (event: ReservationUpdatedEvent) => {
      const r = event.reservation;
      const message = t('toast.guestRoom', { guest: r.guestName, room: r.roomNumber });
      switch (event.action) {
        case 'Checked in':
          this.notificationService.success(message, t('toast.checkedIn'));
          break;
        case 'Checked out':
          this.notificationService.info(message, t('toast.checkedOut'));
          break;
        case 'Payment':
          this.notificationService.success(message, t('toast.payment'));
          break;
        case 'Cancelled':
          this.notificationService.warning(message, t('toast.cancelled'));
          break;
        case 'No-show':
          this.notificationService.warning(message, t('toast.noShow'));
          break;
        default:
          this.notificationService.info(message, t('toast.updated'));
      }
      this.reservationUpdated$.next(event);
    });

    this.hubConnection.on('roomCreated', (room: Room) => {
      this.notificationService.info(t('toast.roomLabel', { room: room.roomNumber }), t('toast.roomAdded'));
      this.roomCreated$.next(room);
    });

    this.hubConnection.on('roomUpdated', (room: Room) => {
      this.notificationService.info(t('toast.roomLabel', { room: room.roomNumber }), t('toast.roomChanged'));
      this.roomUpdated$.next(room);
    });

    this.hubConnection.on('roomDeleted', (roomId: number) => {
      this.notificationService.warning(t('toast.roomRemoved'));
      this.roomDeleted$.next(roomId);
    });
  }
}
