import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SocialAuthService, OAuthStatus } from '../../services/social-auth.service';

@Component({
  selector: 'app-test-oauth',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="oauth-test-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>security</mat-icon>
          OAuth Configuration Test
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <div class="status-section">
          <h3>OAuth Status</h3>
          <div class="status-grid" *ngIf="oauthStatus">
            <div class="status-item">
              <strong>OAuth Available:</strong> 
              <span [class]="oauthStatus.oauth_available ? 'status-success' : 'status-error'">
                {{ oauthStatus.oauth_available ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="status-item">
              <strong>Google:</strong>
              <span [class]="oauthStatus.providers.google ? 'status-success' : 'status-error'">
                {{ oauthStatus.providers.google ? 'Configured' : 'Not Configured' }}
              </span>
            </div>
            <div class="status-item">
              <strong>GitHub:</strong>
              <span [class]="oauthStatus.providers.github ? 'status-success' : 'status-error'">
                {{ oauthStatus.providers.github ? 'Configured' : 'Not Configured' }}
              </span>
            </div>
          </div>
          
          <div *ngIf="loading" class="loading">
            Loading OAuth status...
          </div>
          
          <div *ngIf="error" class="error">
            Error: {{ error }}
          </div>
        </div>

        <div class="test-buttons" *ngIf="oauthStatus?.oauth_available">
          <h3>Test OAuth Providers</h3>
          <div class="button-group">
            <button 
              mat-raised-button 
              color="primary"
              [disabled]="!(oauthStatus?.providers?.google)"
              (click)="testGoogleOAuth()"
              class="oauth-button google-button">
              <mat-icon>login</mat-icon>
              Test Google OAuth
            </button>
            
            <button 
              mat-raised-button
              [disabled]="!(oauthStatus?.providers?.github)"
              (click)="testGitHubOAuth()"
              class="oauth-button github-button">
              <mat-icon>login</mat-icon>
              Test GitHub OAuth
            </button>
          </div>
        </div>

        <div class="instructions" *ngIf="!oauthStatus?.oauth_available">
          <h3>⚠️ OAuth Not Configured</h3>
          <p>Please follow the OAuth Setup Guide to configure Google and GitHub OAuth:</p>
          <ol>
            <li>Get Google OAuth credentials from Google Cloud Console</li>
            <li>Get GitHub OAuth credentials from GitHub Developer Settings</li>
            <li>Add credentials to backend/.env file</li>
            <li>Restart the backend server</li>
          </ol>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button (click)="refreshStatus()">
          <mat-icon>refresh</mat-icon>
          Refresh Status
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .oauth-test-card {
      max-width: 600px;
      margin: 2rem auto;
    }

    .status-section {
      margin-bottom: 2rem;
    }

    .status-grid {
      display: grid;
      gap: 1rem;
      margin: 1rem 0;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .status-success {
      color: #4caf50;
      font-weight: 500;
    }

    .status-error {
      color: #f44336;
      font-weight: 500;
    }

    .test-buttons {
      margin-bottom: 2rem;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .oauth-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: none;
    }

    .google-button {
      background-color: #4285f4;
      color: white;
    }

    .github-button {
      background-color: #333;
      color: white;
    }

    .loading {
      text-align: center;
      color: #666;
      font-style: italic;
    }

    .error {
      color: #f44336;
      padding: 1rem;
      background-color: #ffebee;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .instructions {
      background-color: #fff3e0;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #ff9800;
    }

    .instructions ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .instructions li {
      margin: 0.5rem 0;
    }
  `]
})
export class TestOAuthComponent implements OnInit {
  oauthStatus: OAuthStatus | null = null;
  loading = false;
  error: string | null = null;

  constructor(private socialAuthService: SocialAuthService) {}

  ngOnInit(): void {
    this.loadOAuthStatus();
  }

  loadOAuthStatus(): void {
    this.loading = true;
    this.error = null;
    
    this.socialAuthService.getOAuthStatus().subscribe({
      next: (status) => {
        this.oauthStatus = status;
        this.loading = false;
        console.log('OAuth Status:', status);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load OAuth status';
        this.loading = false;
        console.error('OAuth Status Error:', error);
      }
    });
  }

  testGoogleOAuth(): void {
    console.log('Testing Google OAuth...');
    this.socialAuthService.loginWithGoogle();
  }

  testGitHubOAuth(): void {
    console.log('Testing GitHub OAuth...');
    this.socialAuthService.loginWithGithub();
  }

  refreshStatus(): void {
    this.loadOAuthStatus();
  }
}
