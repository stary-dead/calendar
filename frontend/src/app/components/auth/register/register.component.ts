import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from '../../../services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageService } from '../../shared';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  showOAuthRedirect = false;
  availableProviders: string[] = [];
  attemptedEmail = '';
  hasPassword = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private errorService = inject(ErrorMessageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    if (field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.showOAuthRedirect = false; // Reset OAuth redirect
      
      const { username, email, password } = this.registerForm.value;
      
      this.authService.register(username, email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // Registration successful, user is automatically logged in
            this.router.navigate(['/calendar']);
          }
          // Trigger change detection to update the UI
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          
          // Check for OAuth account conflict
          if (this.authService.isOAuthAccountError(error)) {
            this.showOAuthRedirect = true;
            this.availableProviders = this.authService.getAvailableProviders(error);
            this.attemptedEmail = this.authService.getErrorEmail(error);
            this.hasPassword = error.error?.has_password || false;
            this.errorService.showError(error.error.error);
            // Trigger change detection to update the UI
            this.cdr.detectChanges();
          } else if (this.authService.isRegularAccountError(error)) {
            // Regular account exists - suggest login
            this.errorService.showError('Account already exists. Please sign in instead.');
            // Trigger change detection to update the UI
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            // Other errors (including username taken, validation errors, etc.)
            let errorMessage = 'Registration failed';
            if (error.error?.error) {
              errorMessage = error.error.error;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.errorService.showError(errorMessage);
            // Trigger change detection to update the UI
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // OAuth methods
  loginWithProvider(provider: string): void {
    if (provider === 'google') {
      this.authService.loginWithGoogle();
    } else if (provider === 'github') {
      this.authService.loginWithGitHub();
    }
  }

  formatProviderName(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  getProviderIcon(provider: string): string {
    switch (provider) {
      case 'google': return 'google';
      case 'github': return 'code';
      default: return 'account_circle';
    }
  }

  // Method to reset OAuth redirect state
  resetOAuthRedirect(): void {
    this.showOAuthRedirect = false;
    this.availableProviders = [];
    this.attemptedEmail = '';
    this.hasPassword = false;
    this.cdr.detectChanges();
  }
}
