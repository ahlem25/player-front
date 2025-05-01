import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  private tokenKey = 'auth_token';
  private jwtHelper = new JwtHelperService();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {
    this.isAuthenticatedSubject.next(this.hasValidToken());
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login_check`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }
}
