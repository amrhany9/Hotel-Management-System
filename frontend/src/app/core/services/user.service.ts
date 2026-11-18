import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateStaffRequest, StaffUser } from '../models/user.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<StaffUser[]> {
    return this.http.get<StaffUser[]>(API_ENDPOINTS.users.base);
  }

  createUser(request: CreateStaffRequest): Observable<StaffUser> {
    return this.http.post<StaffUser>(API_ENDPOINTS.users.base, request);
  }

  setActive(id: number, isActive: boolean): Observable<StaffUser> {
    return this.http.patch<StaffUser>(API_ENDPOINTS.users.status(id), { isActive });
  }
}
