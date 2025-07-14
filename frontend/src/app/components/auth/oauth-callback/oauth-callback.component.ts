import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <mat-card>
          <mat-card-content>
            <div class="loading-content">
              <mat-progress-spinner diameter="50" mode="indeterminate"></mat-progress-spinner>
              <h2>Completing authentication...</h2>
              <p>Please wait while we finish signing you in.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .callback-card {
      mat-card {
        padding: 40px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      h2 {
        margin: 0;
        color: #333;
        font-weight: 500;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Force refresh auth status
    this.authService.checkAuthStatus();
    
    // Wait a bit for auth status to update, then redirect
    setTimeout(() => {
      const user = this.authService.getCurrentUser();
      if (user) {
        // User is authenticated, redirect to calendar
        this.router.navigate(['/calendar']);
      } else {
        // Authentication failed, redirect to login
        this.router.navigate(['/login']);
      }
    }, 1500);
  }
}
