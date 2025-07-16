import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { Category, CATEGORIES } from '../../models/category.model';

export interface CreateSlotData {
  category: number;
  date: string;
  start_time: string;
  end_time: string;
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
        <mat-card-subtitle>Add a new time slot for booking</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="slotForm" (ngSubmit)="onSubmit()" class="slot-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category" required>
                <mat-option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="slotForm.get('category')?.invalid && slotForm.get('category')?.touched">
                Category is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput type="date" formControlName="date" required [min]="minDate">
              <mat-error *ngIf="slotForm.get('date')?.invalid && slotForm.get('date')?.touched">
                Date is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Time</mat-label>
              <input matInput type="time" formControlName="start_time" required>
              <mat-error *ngIf="slotForm.get('start_time')?.invalid && slotForm.get('start_time')?.touched">
                Start time is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Time</mat-label>
              <input matInput type="time" formControlName="end_time" required>
              <mat-error *ngIf="slotForm.get('end_time')?.invalid && slotForm.get('end_time')?.touched">
                <span *ngIf="slotForm.get('end_time')?.errors?.['required']">End time is required</span>
              </mat-error>
              <mat-error *ngIf="slotForm.errors?.['timeOrder'] && slotForm.get('end_time')?.touched">
                End time must be after start time
              </mat-error>
            </mat-form-field>
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

  constructor(private fb: FormBuilder) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    this.slotForm = this.fb.group({
      category: ['', Validators.required],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required]
    }, { validators: this.timeOrderValidator });
  }

  private timeOrderValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const startTime = formGroup.get('start_time')?.value;
    const endTime = formGroup.get('end_time')?.value;
    
    if (startTime && endTime && startTime >= endTime) {
      return { timeOrder: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.slotForm.valid) {
      const formValue = this.slotForm.value;
      
      const createData: CreateSlotData = {
        category: formValue.category,
        date: formValue.date,
        start_time: formValue.start_time,
        end_time: formValue.end_time
      };
      
      this.isCreating = true;
      this.createSlot.emit(createData);
    }
  }

  resetForm(): void {
    this.slotForm.reset();
    this.isCreating = false;
  }

  setCreating(creating: boolean): void {
    this.isCreating = creating;
  }
}
