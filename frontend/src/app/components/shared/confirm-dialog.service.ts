import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '400px',
        disableClose: true,
        data: data
      }
    );

    return dialogRef.afterClosed();
  }

  confirmBooking(timeSlot: any): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Booking',
      message: `Do you want to book this time slot?\n\nCategory: ${timeSlot.category}\nTime: ${timeSlot.startTime} - ${timeSlot.endTime}`,
      confirmText: 'Book Now',
      cancelText: 'Cancel',
      confirmColor: 'primary',
      showIcon: true,
      icon: 'event_available'
    });
  }

  confirmCancelBooking(): Observable<boolean> {
    return this.confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Cancel Booking',
      cancelText: 'Keep Booking',
      confirmColor: 'warn',
      showIcon: true,
      icon: 'event_busy'
    });
  }

  confirmDeleteTimeSlot(): Observable<boolean> {
    return this.confirm({
      title: 'Delete Time Slot',
      message: 'Are you sure you want to delete this time slot? Any existing bookings will be cancelled.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      showIcon: true,
      icon: 'delete'
    });
  }
}
