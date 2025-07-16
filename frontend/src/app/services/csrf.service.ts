import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface CsrfResponse {
  csrfToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfTokenSubject = new BehaviorSubject<string>('');
  public csrfToken$ = this.csrfTokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get CSRF token from backend
   */
  getCsrfToken(): Observable<string> {
    return this.http.get<CsrfResponse>(`${environment.apiUrl}/api/auth/csrf/`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.csrfTokenSubject.next(response.csrfToken);
      }),
      map(response => response.csrfToken)
    );
  }

  /**
   * Get current CSRF token value
   */
  getCurrentToken(): string {
    return this.csrfTokenSubject.value;
  }

  /**
   * Initialize CSRF token on app startup
   */
  async initializeCsrfToken(): Promise<void> {
    try {
      await this.getCsrfToken().toPromise();
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
    }
  }

  /**
   * Get HTTP headers with CSRF token
   */
  getHeaders(additionalHeaders?: { [key: string]: string }): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.getCurrentToken()
    });

    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach(key => {
        headers = headers.set(key, additionalHeaders[key]);
      });
    }

    return headers;
  }

  /**
   * Refresh CSRF token if it expires or becomes invalid
   */
  refreshToken(): Observable<string> {
    return this.getCsrfToken();
  }
}
