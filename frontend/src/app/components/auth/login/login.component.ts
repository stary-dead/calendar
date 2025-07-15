import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  showOAuthOptions = false;
  availableProviders: string[] = [];
  errorEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private errorMessageService: ErrorMessageService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check for OAuth error parameters
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'account_exists') {
        const email = params['email'];
        const message = params['message'] || `Account with email ${email} already exists. Please use regular login form instead.`;
        this.errorMessageService.showError(message);
        
        // Pre-fill email if provided
        if (email) {
          this.loginForm.patchValue({ username: email });
        }
        
        // Clear URL parameters
        this.router.navigate([], { 
          relativeTo: this.route, 
          queryParams: {} 
        });
      }
    });

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
      this.showOAuthOptions = false; // Reset OAuth options
      
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.cdr.detectChanges();
            this.router.navigate(['/calendar']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.log('Login error:', error);
          
          // Check for OAuth-only account error
          if (this.authService.isOAuthAccountError(error)) {
            this.showOAuthOptions = true;
            this.availableProviders = this.authService.getAvailableProviders(error);
            this.errorEmail = this.authService.getErrorEmail(error);
            this.errorMessageService.showError(error.error.error);
          } else {
            // Handle other errors
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
          }
          
          this.cdr.detectChanges();
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
    this.authService.loginWithGoogle();
  }

  loginWithGitHub(): void {
    this.authService.loginWithGitHub();
  }

  // Handle OAuth provider login from error state
  loginWithProvider(provider: string): void {
    if (provider === 'google') {
      this.loginWithGoogle();
    } else if (provider === 'github') {
      this.loginWithGitHub();
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Helper method to format provider name
  formatProviderName(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
