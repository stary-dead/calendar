import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from '../../../services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageService } from '../../shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private errorMessageService: ErrorMessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // If user is already logged in, redirect to calendar
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/calendar']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
          this.router.navigate(['/calendar']);
        },
        error: (error) => {
          this.isLoading = false;
          console.log('Login error:', error); // For debugging
          
          // Handle different error response formats
          let errorMsg = 'Login failed. Please try again.';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMsg = error.error;
            } else if (error.error.error) {
              errorMsg = error.error.error;
            } else if (error.error.message) {
              errorMsg = error.error.message;
            }
          }
          
          this.errorMessageService.showError(errorMsg);
          this.cdr.detectChanges(); // Force change detection
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    return '';
  }

  // OAuth login methods
  loginWithGoogle(): void {
    // Простое перенаправление на Google OAuth
    window.location.href = 'http://localhost/oauth/google/login/';
  }

  loginWithGitHub(): void {
    // Простое перенаправление на GitHub OAuth
    window.location.href = 'http://localhost/oauth/github/login/';
  }
}
