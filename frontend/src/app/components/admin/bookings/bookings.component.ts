import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <mat-icon>bookmark</mat-icon>
          View All Bookings
        </mat-card-title>
        <mat-card-subtitle>Overview of all user bookings in the system</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Admin bookings overview will be implemented in Stage 7.</p>
        <p>Admins will be able to:</p>
        <ul>
          <li>View all bookings across all time slots</li>
          <li>See which user booked each slot</li>
          <li>Filter bookings by date, category, or user</li>
          <li>Export booking data</li>
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
export class BookingsComponent {}
