import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, CreateRoomRequest, UpdateRoomRequest, AvailableRoomsQuery } from '../models/room.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(API_ENDPOINTS.rooms.base);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(API_ENDPOINTS.rooms.byId(id));
  }

  getAvailableRooms(query: AvailableRoomsQuery): Observable<Room[]> {
    let params = new HttpParams()
      .set('checkIn', query.checkIn)
      .set('checkOut', query.checkOut);

    if (query.roomType) {
      params = params.set('roomType', query.roomType);
    }
    if (query.maxPrice !== undefined && query.maxPrice !== null) {
      params = params.set('maxPrice', query.maxPrice.toString());
    }

    return this.http.get<Room[]>(API_ENDPOINTS.rooms.available, { params });
  }

  createRoom(room: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(API_ENDPOINTS.rooms.base, room);
  }

  updateRoom(id: number, room: UpdateRoomRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.rooms.byId(id), room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.rooms.byId(id));
  }
}
