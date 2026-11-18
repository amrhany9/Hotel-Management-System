import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Reservation,
  ReservationDetail,
  CreateReservationRequest,
  RecordPaymentRequest,
} from '../models/reservation.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(API_ENDPOINTS.reservations.base);
  }

  getReservationById(id: number): Observable<ReservationDetail> {
    return this.http.get<ReservationDetail>(API_ENDPOINTS.reservations.byId(id));
  }

  createReservation(reservation: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(API_ENDPOINTS.reservations.base, reservation);
  }

  cancelReservation(id: number): Observable<ReservationDetail> {
    return this.http.post<ReservationDetail>(API_ENDPOINTS.reservations.cancel(id), {});
  }

  checkIn(id: number): Observable<ReservationDetail> {
    return this.http.post<ReservationDetail>(API_ENDPOINTS.reservations.checkIn(id), {});
  }

  checkOut(id: number): Observable<ReservationDetail> {
    return this.http.post<ReservationDetail>(API_ENDPOINTS.reservations.checkOut(id), {});
  }

  markNoShow(id: number): Observable<ReservationDetail> {
    return this.http.post<ReservationDetail>(API_ENDPOINTS.reservations.noShow(id), {});
  }

  recordPayment(id: number, payment: RecordPaymentRequest): Observable<ReservationDetail> {
    return this.http.post<ReservationDetail>(API_ENDPOINTS.reservations.payments(id), payment);
  }
}
