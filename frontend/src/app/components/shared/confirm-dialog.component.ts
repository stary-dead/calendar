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
        <p>{{ data.message }}</p>
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
      min-width: 300px;
      max-width: 500px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      margin-bottom: 0;
    }

    .dialog-icon {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.6);
    }

    .dialog-content {
      margin: 16px 0;
    }

    .dialog-content p {
      margin: 0;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.8);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding: 16px 0 0 0;
    }

    .cancel-button {
      margin-right: 8px;
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
}
