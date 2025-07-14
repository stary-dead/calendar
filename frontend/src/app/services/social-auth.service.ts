import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OAuthStatus {
  oauth_available: boolean;
  providers: {
    google: boolean;
    github: boolean;
  };
}

export interface SocialAccount {
  provider: string;
  uid: string;
  extra_data: any;
}

export interface SocialAccountsResponse {
  accounts: SocialAccount[];
}

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {

  constructor(private http: HttpClient) {}

  /**
   * Check if OAuth providers are available and configured
   */
  getOAuthStatus(): Observable<OAuthStatus> {
    return this.http.get<OAuthStatus>(`${environment.apiUrl}/api/oauth/status/`);
  }

  /**
   * Get user's connected social accounts
   */
  getSocialAccounts(): Observable<SocialAccountsResponse> {
    return this.http.get<SocialAccountsResponse>(`${environment.apiUrl}/api/oauth/accounts/`);
  }

  /**
   * Redirect to Google OAuth login
   * Uses django-allauth redirect-based flow
   */
  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth/google/login/`;
  }

  /**
   * Redirect to GitHub OAuth login  
   * Uses django-allauth redirect-based flow
   */
  loginWithGithub(): void {
    window.location.href = `${environment.apiUrl}/oauth/github/login/`;
  }

  /**
   * Handle OAuth callback - typically called after redirect
   * The actual OAuth handling is done by django-allauth backend
   */
  handleOAuthCallback(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/oauth/callback/`);
  }
}
