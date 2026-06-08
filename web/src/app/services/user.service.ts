import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDetail {
  id?: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/user';

  private getHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(this.baseUrl, { headers: this.getHeaders() });
  }

  createUser(payload: UserDetail): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload, { headers: this.getHeaders() });
  }

  updateUser(id: number, payload: Partial<UserDetail>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}
