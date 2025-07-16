import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  showIcon?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon *ngIf="data.showIcon" class="dialog-icon">{{ data.icon || 'help' }}</mat-icon>
        {{ data.title }}
      </h2>
      
      <mat-dialog-content class="dialog-content">
        <p [innerHTML]="formatMessage(data.message)"></p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-button">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.confirmColor || 'primary'"
          (click)="onConfirm()"
          class="confirm-button">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 400px;
      max-width: 600px;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      padding: 16px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      margin-bottom: 0;
      padding: 8px 0;
      flex-shrink: 0;
    }

    .dialog-icon {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.6);
    }

    .dialog-content {
      margin: 8px 0;
      padding: 8px 0;
      flex: 1;
      overflow: visible;
    }

    .dialog-content p {
      margin: 0;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.8);
      word-wrap: break-word;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
      padding: 8px 0 0 0;
      flex-shrink: 0;
    }

    .cancel-button {
      margin-right: 8px;
    }

    /* Ensure proper spacing in Material Dialog */
    :host ::ng-deep .mat-mdc-dialog-container {
      padding: 24px !important;
    }

    :host ::ng-deep .mat-mdc-dialog-content {
      margin: 0 !important;
      padding: 0 !important;
      max-height: none !important;
    }

    :host ::ng-deep .mat-mdc-dialog-actions {
      margin: 0 !important;
      padding: 0 !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  formatMessage(message: string): string {
    // Convert newlines to HTML breaks for better display
    return message.replace(/\n/g, '<br>');
  }
}
