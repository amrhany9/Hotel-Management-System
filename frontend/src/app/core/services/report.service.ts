import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TopRoomReport, RevenueReport, OccupancyReportItem, DashboardStats } from '../models/report.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(API_ENDPOINTS.reports.dashboard);
  }

  getTopRooms(take = 5): Observable<TopRoomReport[]> {
    return this.http.get<TopRoomReport[]>(API_ENDPOINTS.reports.topRooms(take));
  }

  getRevenue(from: string, to: string): Observable<RevenueReport> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<RevenueReport>(API_ENDPOINTS.reports.revenue, { params });
  }

  getOccupancy(from: string, to: string): Observable<OccupancyReportItem[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<OccupancyReportItem[]>(API_ENDPOINTS.reports.occupancy, { params });
  }
}
