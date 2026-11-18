import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HotelSettings } from '../models/user.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const DEFAULT_SETTINGS: HotelSettings = {
  hotelName: 'Grand Horizon Hotel',
  address: '',
  phone: '',
  email: '',
  currency: 'USD',
  demoMode: false,
  demoResetHourUtc: 3,
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);

  readonly settings = signal<HotelSettings>(DEFAULT_SETTINGS);

  async load(): Promise<void> {
    try {
      this.settings.set(await firstValueFrom(this.http.get<HotelSettings>(API_ENDPOINTS.settings)));
    } catch {
      this.settings.set(DEFAULT_SETTINGS);
    }
  }
}
