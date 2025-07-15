import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

export interface ErrorMessageConfig {
  message: string;
  action?: string;
  duration?: number;
  panelClass?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  constructor(private snackBar: MatSnackBar) {}

  showError(config: ErrorMessageConfig | string): MatSnackBarRef<SimpleSnackBar> {
    let errorConfig: ErrorMessageConfig;
    
    if (typeof config === 'string') {
      errorConfig = { message: config };
    } else {
      errorConfig = config;
    }

    const snackBarConfig: MatSnackBarConfig = {
      duration: errorConfig.duration || 5000,
      panelClass: errorConfig.panelClass || ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    };

    return this.snackBar.open(
      errorConfig.message,
      errorConfig.action || 'Close',
      snackBarConfig
    );
  }

  showSuccess(message: string, action: string = 'Close', duration: number = 3000): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showWarning(message: string, action: string = 'Close', duration: number = 4000): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, action: string = 'Close', duration: number = 3000): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
