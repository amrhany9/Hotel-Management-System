import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenKey = 'hotel_jwt_token';
  private readonly userKey = 'hotel_user_info';

  private userSignal = signal<AuthResponse | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(this.userSignal() ? this.getStoredToken() : null);

  public isAuthenticated = computed(() => !!this.tokenSignal());
  public currentUser = computed(() => this.userSignal());
  public isAdmin = computed(() => this.userSignal()?.role === 'Admin');

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private getStoredUser(): AuthResponse | null {
    try {
      const data = localStorage.getItem(this.userKey);
      const user: AuthResponse | null = data ? JSON.parse(data) : null;
      return user?.role ? user : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch {}

    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: AuthResponse): void {
    try {
      localStorage.setItem(this.tokenKey, authResult.token);
      localStorage.setItem(this.userKey, JSON.stringify(authResult));
    } catch {}

    this.tokenSignal.set(authResult.token);
    this.userSignal.set(authResult);
  }
}
