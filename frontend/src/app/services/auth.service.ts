import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models';

interface LoginResponse {
  success: boolean;
  message?: string;
  user: User;
}

interface UserInfoResponse {
  success: boolean;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in on service initialization
    this.checkAuthStatus();
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login/`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        }
      }),
      // Return user from response
      map((response: LoginResponse) => response.user),
      // Handle errors and reset user
      tap({
        error: () => this.setCurrentUser(null)
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/auth/logout/`, {}).pipe(
      tap(() => {
        this.setCurrentUser(null);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.is_staff : false;
  }

  private checkAuthStatus(): void {
    this.http.get<UserInfoResponse>(`${environment.apiUrl}/api/auth/user/`).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.setCurrentUser(response.user);
        } else {
          this.setCurrentUser(null);
        }
      },
      error: () => this.setCurrentUser(null)
    });
  }
}
