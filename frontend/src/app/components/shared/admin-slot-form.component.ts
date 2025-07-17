import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { Category, CATEGORIES } from '../../models/category.model';

export interface CreateSlotData {
  category: number;
  start_time: string; // ISO DateTime string
  end_time: string;   // ISO DateTime string
}

@Component({
  selector: 'app-admin-slot-form',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <mat-card class="admin-form">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>add_circle</mat-icon>
          Create New Time Slot
        </mat-card-title>
      </mat-card-header>
      <br>
      <mat-card-content>
        <form [formGroup]="slotForm" (ngSubmit)="onSubmit()" class="slot-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select #category_select formControlName="category" required>
                <mat-option *ngFor="let category of categories" [value]="category.id" (click)="category_select.close()">
                  {{ category.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="slotForm.get('category')?.invalid && slotForm.get('category')?.touched">
                Category is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" required [min]="minDateObj" readonly (click)="picker.open()">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="slotForm.get('date')?.invalid && slotForm.get('date')?.touched">
                Date is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <div class="time-picker-group">
              <mat-form-field appearance="outline" class="time-field">
                <mat-label>Start Time</mat-label>
                <mat-select #start_time_select formControlName="start_time" required>
                  <mat-option *ngFor="let time of availableStartTimes" [value]="time" (click)="start_time_select.close()">
                    {{ time }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>schedule</mat-icon>
                <mat-hint *ngIf="slotForm.get('end_time')?.value">
                  Available until {{ slotForm.get('end_time')?.value }}
                </mat-hint>
                <mat-error *ngIf="slotForm.get('start_time')?.invalid && slotForm.get('start_time')?.touched">
                  Start time is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="time-picker-group">
              <mat-form-field appearance="outline" class="time-field">
                <mat-label>End Time</mat-label>
                <mat-select #end_time_select formControlName="end_time" required>
                  <mat-option *ngFor="let time of availableEndTimes" [value]="time" (click)="end_time_select.close()">
                    {{ time }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>schedule</mat-icon>
                <mat-hint *ngIf="slotForm.get('start_time')?.value">
                  Available from {{ slotForm.get('start_time')?.value }}
                </mat-hint>
                <mat-error *ngIf="slotForm.get('end_time')?.invalid && slotForm.get('end_time')?.touched">
                  <span *ngIf="slotForm.get('end_time')?.errors?.['required']">End time is required</span>
                </mat-error>
                <mat-error *ngIf="slotForm.errors?.['timeOrder'] && slotForm.get('end_time')?.touched">
                  End time must be after start time
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="slotForm.invalid || isCreating">
              <mat-icon>add</mat-icon>
              {{ isCreating ? 'Creating...' : 'Create Slot' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .admin-form {
      margin-bottom: 20px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .slot-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    
    .form-row mat-form-field {
      flex: 1;
    }
    
    .time-picker-group {
      flex: 1;
    }
    
    .time-field {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-start;
      margin-top: 16px;
    }
    
    button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Datepicker input styling */
    input[readonly] {
      cursor: pointer;
    }
    
    mat-icon[matSuffix] {
      color: rgba(0, 0, 0, 0.54);
    }
    
    mat-hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class AdminSlotFormComponent {
  @Output() createSlot = new EventEmitter<CreateSlotData>();
  
  categories: Category[] = CATEGORIES;
  slotForm: FormGroup;
  isCreating = false;
  minDate: string;
  minDateObj: Date;
  timeSlots: string[] = [];
  availableStartTimes: string[] = [];
  availableEndTimes: string[] = [];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.minDateObj = today;
    
    // Generate time slots
    this.generateTimeSlots();
    
    // Initialize available times
    this.availableStartTimes = [...this.timeSlots];
    this.availableEndTimes = [...this.timeSlots];
    
    this.slotForm = this.fb.group({
      category: ['', Validators.required],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required]
    }, { validators: this.timeOrderValidator });
    
    // Subscribe to start_time changes to filter end_time options
    this.slotForm.get('start_time')?.valueChanges.subscribe(startTime => {
      console.log('Start time changed:', typeof startTime, startTime);
      this.updateAvailableEndTimes(startTime);
    });
    
    // Subscribe to end_time changes to filter start_time options
    this.slotForm.get('end_time')?.valueChanges.subscribe(endTime => {
      console.log('End time changed:', typeof endTime, endTime);
      this.updateAvailableStartTimes(endTime);
    });
  }

  private generateTimeSlots(): void {
    const slots = [];
    // Working hours: 8:00 to 21:00
    for (let hour = 8; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        slots.push(`${hourStr}:${minuteStr}`);
      }
    }
    this.timeSlots = slots;
  }

  private timeOrderValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const startTime = formGroup.get('start_time')?.value;
    const endTime = formGroup.get('end_time')?.value;
    
    // Only validate if both times are selected
    if (startTime && endTime) {
      const startMinutes = this.timeToMinutes(startTime);
      const endMinutes = this.timeToMinutes(endTime);
      
      if (startMinutes >= endMinutes) {
        return { timeOrder: true };
      }
    }
    
    return null;
  }

  private timeToMinutes(timeString: string | any): number {
    // Handle both string time format and Date objects
    if (typeof timeString !== 'string') {
      if (timeString instanceof Date) {
        timeString = timeString.toTimeString().substring(0, 5);
      } else {
        console.warn('Invalid time format:', timeString);
        return 0;
      }
    }
    
    const [hours, minutes] = timeString.split(':').map((num: string) => parseInt(num, 10));
    return hours * 60 + minutes;
  }

  private updateAvailableEndTimes(startTime: string): void {
    if (!startTime) {
      this.availableEndTimes = [...this.timeSlots];
      this.cdr.detectChanges();
      return;
    }
    
    const startMinutes = this.timeToMinutes(startTime);
    this.availableEndTimes = this.timeSlots.filter(time => {
      const timeMinutes = this.timeToMinutes(time);
      return timeMinutes > startMinutes;
    });
    this.cdr.detectChanges();
  }

  private updateAvailableStartTimes(endTime: string): void {
    if (!endTime) {
      this.availableStartTimes = [...this.timeSlots];
      this.cdr.detectChanges();
      return;
    }
    
    const endMinutes = this.timeToMinutes(endTime);
    this.availableStartTimes = this.timeSlots.filter(time => {
      const timeMinutes = this.timeToMinutes(time);
      return timeMinutes < endMinutes;
    });
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.slotForm.valid) {
      const formValue = this.slotForm.value;
      
      // Get the selected date
      let selectedDate: Date;
      if (formValue.date instanceof Date) {
        selectedDate = formValue.date;
      } else {
        selectedDate = new Date(formValue.date);
      }
      
      // Ensure time values are strings in HH:MM format
      let startTimeStr = formValue.start_time;
      let endTimeStr = formValue.end_time;
      
      if (startTimeStr instanceof Date) {
        startTimeStr = startTimeStr.toTimeString().substring(0, 5);
      }
      if (endTimeStr instanceof Date) {
        endTimeStr = endTimeStr.toTimeString().substring(0, 5);
      }
      
      // Create full DateTime strings by combining date + time
      const startDateTime = this.combineDateAndTime(selectedDate, startTimeStr);
      const endDateTime = this.combineDateAndTime(selectedDate, endTimeStr);
      
      const createData: CreateSlotData = {
        category: formValue.category,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      };
      
      this.isCreating = true;
      this.createSlot.emit(createData);
    }
  }

  private combineDateAndTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours, minutes, 0, 0);
    return combinedDateTime;
  }

  resetForm(): void {
    this.slotForm.reset();
    this.slotForm.markAsUntouched();
    this.slotForm.markAsPristine();
    
    // Reset individual form controls
    Object.keys(this.slotForm.controls).forEach(key => {
      const control = this.slotForm.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });
    
    this.isCreating = false;
    // Reset available time slots
    this.availableStartTimes = [...this.timeSlots];
    this.availableEndTimes = [...this.timeSlots];
    this.cdr.detectChanges();
  }

  setCreating(creating: boolean): void {
    this.isCreating = creating;
    this.cdr.detectChanges();
  }

  forceUpdateState(): void {
    this.cdr.detectChanges();
  }
}
