import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface LoginResponse {
  status: number;
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  status: number;
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  // Signals for application-wide authentication state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadInitialState();
  }

  // Load auth state from localStorage (browser-side only)
  private loadInitialState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('access_token');
      const userJson = localStorage.getItem('user');

      if (token && userJson) {
        try {
          this.currentUser.set(JSON.parse(userJson));
          this.isAuthenticated.set(true);
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  login(payload: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap(response => {
        if (response.access_token && response.user) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  register(payload: { username: string; email: string; password: string; role?: string; is_active?: boolean }): Observable<RegisterResponse> {
    const fullPayload = {
      role: 'user',
      is_active: true,
      ...payload
    };
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, fullPayload);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
