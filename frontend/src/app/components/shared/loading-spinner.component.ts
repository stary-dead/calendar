import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [ngClass]="containerClass">
      <mat-progress-spinner 
        [diameter]="diameter"
        [strokeWidth]="strokeWidth"
        [mode]="mode"
        [value]="value">
      </mat-progress-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 1000;
    }

    .loading-container.inline {
      position: relative;
      min-height: 100px;
    }

    .loading-message {
      margin-top: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() value: number = 0;
  @Input() message: string = '';
  @Input() overlay: boolean = false;

  get containerClass(): string {
    return this.overlay ? 'overlay' : 'inline';
  }
}
