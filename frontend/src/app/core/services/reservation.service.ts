import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, CreateReservationRequest } from '../models/reservation.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(API_ENDPOINTS.reservations.base);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(API_ENDPOINTS.reservations.byId(id));
  }

  createReservation(reservation: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(API_ENDPOINTS.reservations.base, reservation);
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.reservations.cancel(id), {});
  }
}
