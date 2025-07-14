import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Calendar View</mat-card-title>
        <mat-card-subtitle>Weekly calendar with time slots</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Calendar component will be implemented in Stage 5-6.</p>
        <p>This will show the weekly calendar view with available time slots for booking.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 20px auto;
    }
  `]
})
export class CalendarComponent {}
