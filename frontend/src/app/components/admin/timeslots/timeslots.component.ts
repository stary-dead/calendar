import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-timeslots',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <mat-icon>schedule</mat-icon>
          Manage Time Slots
        </mat-card-title>
        <mat-card-subtitle>Create and manage available time slots for booking</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Admin time slots management will be implemented in Stage 7.</p>
        <p>Admins will be able to:</p>
        <ul>
          <li>Create new time slots for each category (Cat 1, Cat 2, Cat 3)</li>
          <li>View all existing time slots</li>
          <li>Edit or delete time slots</li>
          <li>See booking status for each slot</li>
        </ul>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 20px auto;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    ul {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    li {
      margin-bottom: 8px;
    }
  `]
})
export class TimeslotsComponent {}
