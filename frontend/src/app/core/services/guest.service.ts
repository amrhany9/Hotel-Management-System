import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Guest } from '../models/guest.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  private http = inject(HttpClient);

  getGuests(search?: string): Observable<Guest[]> {
    const params = search?.trim() ? new HttpParams().set('search', search.trim()) : undefined;
    return this.http.get<Guest[]>(API_ENDPOINTS.guests.base, { params });
  }

  lookupByPhone(phone: string): Observable<Guest | null> {
    const params = new HttpParams().set('phone', phone);
    return this.http
      .get<Guest>(API_ENDPOINTS.guests.lookup, { params, observe: 'response' })
      .pipe(map((res) => (res.status === 200 ? res.body : null)));
  }
}
