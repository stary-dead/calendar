import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { CategoryFilterComponent, CategorySelection, ErrorMessageService, ConfirmDialogService, AdminSlotFormComponent, CreateSlotData } from '../shared';
import { Category, CATEGORIES } from '../../models/category.model';
import { BookingService, TimeSlot } from '../../services/booking.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    CategoryFilterComponent,
    AdminSlotFormComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild(AdminSlotFormComponent) adminSlotForm!: AdminSlotFormComponent;
  
  private destroy$ = new Subject<void>();
  
  categorySelection: CategorySelection = {
    cat1: true, // По умолчанию все категории включены
    cat2: true,
    cat3: true
  };
  
  categories: Category[] = [];
  timeSlots: TimeSlot[] = [];
  isLoading = false;
  currentWeekStart: Date = new Date();
  weekDays: Array<{name: string, date: Date}> = [];
  displayHours: number[] = Array.from({length: 14}, (_, i) => i + 8); // 8:00 - 21:00
  
  private readonly STORAGE_KEY = 'calendar_category_filter';
  
  constructor(
    private errorMessageService: ErrorMessageService,
    private bookingService: BookingService,
    private websocketService: WebSocketService,
    private authService: AuthService,
    private confirmDialogService: ConfirmDialogService,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService
  ) {
    // Ensure loading starts as false
    this.isLoading = false;
  }
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadSelectionFromStorage();
    this.initializeWeek();
    this.setupWebSocketConnection();
    // Load user bookings first, then load time slots
    this.bookingService.loadUserBookings();
    this.loadTimeSlots();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  get hasAnySelection(): boolean {
    return this.categorySelection.cat1 || this.categorySelection.cat2 || this.categorySelection.cat3;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  onCategorySelectionChange(selection: CategorySelection): void {
    this.categorySelection = { ...selection };
    this.saveSelectionToStorage();
    this.loadTimeSlots(); // Reload time slots when categories change
  }

  // Week navigation methods
  previousWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.updateWeekDays();
    this.loadTimeSlots();
  }

  nextWeek(): void {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.updateWeekDays();
    this.loadTimeSlots();
  }

  // Display methods
  getWeekDisplayText(): string {
    const weekNumber = this.getWeekNumber(this.currentWeekStart);
    const year = this.currentWeekStart.getFullYear();
    return `Week ${weekNumber}, ${year}`;
  }

  getWeekRangeText(): string {
    const endDate = new Date(this.currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const startStr = this.formatDate(this.currentWeekStart);
    const endStr = this.formatDate(endDate);
    return `${startStr} - ${endStr}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  formatSlotTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }

  // Slot management methods
  getSlotsForDayAndHour(date: Date, hour: number): TimeSlot[] {
    return this.timeSlots.filter(slot => {
      const slotDate = new Date(slot.start_time);
      return (
        slotDate.toDateString() === date.toDateString() &&
        slotDate.getHours() === hour
      );
    });
  }

  getSlotClass(slot: TimeSlot): string[] {
    const classes = ['time-slot'];
    
    // Category-based styling
    classes.push(`category-${slot.category_name.toLowerCase().replace(' ', '')}`);
    
    // Check if slot is expired (past time)
    const now = new Date();
    const slotStart = new Date(slot.start_time);
    const isExpired = slotStart < now;
    
    // Status-based styling
    if (isExpired) {
      classes.push('slot-expired');
    } else if (slot.is_booked) {
      classes.push('slot-booked');
      if (this.isMyBooking(slot)) {
        classes.push('slot-my-booking');
      }
    } else if (slot.can_book) {
      classes.push('slot-available');
    } else {
      classes.push('slot-unavailable');
    }
    
    return classes;
  }

  getSlotTooltip(slot: TimeSlot): string {
    let tooltip = `${slot.category_name}\n${this.formatSlotTime(slot.start_time, slot.end_time)}`;
    
    // Check if slot is expired (past time)
    const now = new Date();
    const slotStart = new Date(slot.start_time);
    const isExpired = slotStart < now;
    
    if (isExpired) {
      tooltip += '\n\nTime has expired - Cannot book';
    } else if (slot.is_booked) {
      if (this.isMyBooking(slot)) {
        tooltip += '\n\nYour booking - Click to cancel';
      } else {
        tooltip += '\n\nBooked by another user';
        // Show booked user info for admins
        if (this.isAdmin && slot.booked_by) {
          tooltip += `\nBooked by: ${slot.booked_by}`;
        }
      }
    } else if (slot.can_book) {
      tooltip += '\n\nAvailable - Click to book';
    } else {
      tooltip += '\n\nUnavailable';
    }

    // Add admin context menu hint
    if (this.isAdmin) {
      tooltip += '\n\nRight-click for admin options';
    }
    
    return tooltip;
  }

  getCategoryColor(categoryName: string): 'primary' | 'accent' | 'warn' {
    switch (categoryName) {
      case 'Cat 1': return 'primary';
      case 'Cat 2': return 'accent';
      case 'Cat 3': return 'warn';
      default: return 'primary';
    }
  }

  canInteractWithSlot(slot: TimeSlot): boolean {
    // Check if slot is expired (past time)
    const now = new Date();
    const slotStart = new Date(slot.start_time);
    const isExpired = slotStart < now;
    
    if (isExpired) {
      return false; // Cannot interact with expired slots
    }
    
    return (slot.can_book && !slot.is_booked) || this.isMyBooking(slot);
  }

  isMyBooking(slot: TimeSlot): boolean {
    return this.bookingService.isTimeSlotBookedByUser(slot.id);
  }

  isSlotExpired(slot: TimeSlot): boolean {
    const now = new Date();
    const slotStart = new Date(slot.start_time);
    return slotStart < now;
  }

  // Slot interaction
  onSlotClick(slot: TimeSlot): void {
    // Check if slot is expired (past time)
    const now = new Date();
    const slotStart = new Date(slot.start_time);
    const isExpired = slotStart < now;
    
    if (isExpired) {
      this.errorMessageService.showError('This time slot has expired and cannot be booked or cancelled.');
      return;
    }
    
    if (!this.canInteractWithSlot(slot)) {
      return;
    }

    if (slot.is_booked && this.isMyBooking(slot)) {
      this.cancelBooking(slot);
    } else if (!slot.is_booked && slot.can_book) {
      this.createBooking(slot);
    }
  }

  // Admin context menu
  onSlotRightClick(event: MouseEvent, slot: TimeSlot): void {
    if (!this.isAdmin) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (slot.is_booked) {
      // If slot is booked, show option to cancel booking and then delete
      this.confirmDialogService.confirm({
        title: 'Cancel Booking and Delete Time Slot',
        message: `This time slot is booked by another user. Do you want to cancel the booking and delete the time slot?\n\nCategory: ${slot.category_name}\nTime: ${this.formatSlotTime(slot.start_time, slot.end_time)}\nBooked by: ${slot.booked_by}\n\nThis action cannot be undone.`,
        confirmText: 'Cancel Booking & Delete',
        cancelText: 'Cancel'
      }).subscribe(confirmed => {
        if (confirmed) {
          this.adminCancelBookingAndDeleteSlot(slot);
        }
      });
    } else {
      // If slot is not booked, show regular delete option
      this.confirmDialogService.confirm({
        title: 'Delete Time Slot',
        message: `Are you sure you want to delete this time slot?\n\nCategory: ${slot.category_name}\nTime: ${this.formatSlotTime(slot.start_time, slot.end_time)}\n\nThis action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }).subscribe(confirmed => {
        if (confirmed) {
          this.deleteTimeSlot(slot);
        }
      });
    }
  }

  // Admin slot creation
  onCreateSlot(slotData: CreateSlotData): void {
    if (!this.isAdmin) {
      this.errorMessageService.showError('Unauthorized: Admin access required');
      return;
    }

    // slotData already contains properly formatted DateTime strings
    // Validate that the DateTime strings are valid
    const startDate = new Date(slotData.start_time);
    const endDate = new Date(slotData.end_time);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.adminSlotForm.setCreating(false);
      this.adminSlotForm.forceUpdateState();
      this.errorMessageService.showError('Invalid date or time format');
      return;
    }
    
    // Validate that end time is after start time
    if (endDate <= startDate) {
      this.adminSlotForm.setCreating(false);
      this.adminSlotForm.forceUpdateState();
      this.errorMessageService.showError('End time must be after start time');
      return;
    }

    const timeSlotPayload = {
      category: slotData.category,
      start_time: slotData.start_time, // Already ISO string
      end_time: slotData.end_time       // Already ISO string
    };

    this.apiService.createTimeSlot(timeSlotPayload).subscribe({
      next: () => {
        this.errorMessageService.showSuccess('Time slot created successfully!');
        this.adminSlotForm.resetForm();
        this.loadTimeSlots(); // Refresh slots
      },
      error: (error) => {
        console.error('Failed to create time slot:', error);
        this.adminSlotForm.setCreating(false);
        this.adminSlotForm.forceUpdateState();
        
        let errorMessage = 'Failed to create time slot. Please try again.';
        
        // Handle specific validation errors
        if (error.error) {
          // Handle DRF validation errors format
          if (error.error.non_field_errors && Array.isArray(error.error.non_field_errors)) {
            errorMessage = error.error.non_field_errors[0];
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else {
            // Handle field-specific errors
            const fieldErrors: string[] = [];
            Object.keys(error.error).forEach(field => {
              if (Array.isArray(error.error[field])) {
                fieldErrors.push(`${field}: ${error.error[field][0]}`);
              } else {
                fieldErrors.push(`${field}: ${error.error[field]}`);
              }
            });
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            }
          }
        }
        
        // Translate common server error messages to user-friendly text
        if (errorMessage.includes('Time slot overlaps with existing slot')) {
          errorMessage = 'This time slot overlaps with an existing time slot for the same category. Please choose a different time.';
        } else if (errorMessage.includes('Start time must be before end time')) {
          errorMessage = 'Start time must be before end time. Please check your time selection.';
        }
        
        // Ensure error message is shown after state update
        setTimeout(() => {
          this.errorMessageService.showError(errorMessage);
        }, 0);
      }
    });
  }

  private deleteTimeSlot(slot: TimeSlot): void {
    this.apiService.deleteTimeSlot(slot.id).subscribe({
      next: () => {
        this.errorMessageService.showSuccess('Time slot deleted successfully!');
        this.loadTimeSlots(); // Refresh slots
      },
      error: (error) => {
        console.error('Failed to delete time slot:', error);
        
        let errorMessage = 'Failed to delete time slot. Please try again.';
        
        // Handle specific error responses
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
        
        // Translate common server error messages to user-friendly text
        if (errorMessage.includes('Cannot delete booked time slot')) {
          errorMessage = 'Cannot delete this time slot because it is already booked by a user. Please cancel the booking first.';
        }
        
        this.errorMessageService.showError(errorMessage);
      }
    });
  }

  private adminCancelBookingAndDeleteSlot(slot: TimeSlot): void {
    // For admin operations, we need to get booking details from the admin API
    // since regular users don't have access to other users' booking IDs
    
    console.log('Admin trying to cancel booking and delete slot:', slot);
    
    // Use the admin API to get all bookings and find the one for this slot
    this.apiService.getAllBookings().subscribe({
      next: (bookings: any[]) => {
        console.log('All bookings received:', bookings);
        console.log('Looking for booking with time_slot.id:', slot.id);
        
        const booking = bookings.find((b: any) => {
          console.log('Checking booking:', b, 'time_slot_info:', b.time_slot_info);
          return b.time_slot_info?.id === slot.id;
        });
        
        console.log('Found booking:', booking);
        
        if (!booking) {
          console.log('No booking found for slot', slot.id, 'attempting direct delete');
          // If no booking found, just try to delete the slot
          this.deleteTimeSlot(slot);
          return;
        }

        console.log('Step 1: Cancelling booking with ID:', booking.id);
        // Step 1: Cancel the booking using admin endpoint
        this.apiService.adminCancelBooking(booking.id).subscribe({
          next: () => {
            console.log('Step 2: Booking cancelled successfully, now deleting slot');
            // Step 2: After successful booking cancellation, delete the time slot
            this.deleteTimeSlot(slot);
          },
          error: (error) => {
            console.error('Failed to cancel booking:', error);
            
            let errorMessage = 'Failed to cancel booking. Please try again.';
            if (error.error) {
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.error) {
                errorMessage = error.error.error;
              } else if (error.error.detail) {
                errorMessage = error.error.detail;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              }
            }
            
            this.errorMessageService.showError(errorMessage);
          }
        });
      },
      error: (error) => {
        console.error('Failed to get bookings:', error);
        this.errorMessageService.showError('Failed to get booking information. Please try again.');
      }
    });
  }

  private createBooking(slot: TimeSlot): void {
    this.confirmDialogService.confirmBooking({
      category: slot.category_name,
      startTime: new Date(slot.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: new Date(slot.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }).subscribe(confirmed => {
      if (confirmed) {
        this.bookingService.createBooking(slot.id).subscribe({
          next: () => {
            this.errorMessageService.showSuccess('Booking created successfully!');
            this.loadTimeSlots(); // Refresh slots
          },
          error: (error) => {
            console.error('Failed to create booking:', error);
            
            let errorMessage = 'Failed to create booking. Please try again.';
            
            // Handle specific error responses
            if (error.error) {
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.detail) {
                errorMessage = error.error.detail;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.time_slot && Array.isArray(error.error.time_slot)) {
                errorMessage = error.error.time_slot[0];
              }
            }
            
            // Translate common server error messages to user-friendly text
            if (errorMessage.includes('Time slot is already booked')) {
              errorMessage = 'This time slot has already been booked by another user.';
            } else if (errorMessage.includes('Time slot has passed')) {
              errorMessage = 'This time slot has already passed and cannot be booked.';
            } else if (errorMessage.includes('You already have a booking')) {
              errorMessage = 'You already have a booking at this time.';
            }
            
            this.errorMessageService.showError(errorMessage);
          }
        });
      }
    });
  }

  private cancelBooking(slot: TimeSlot): void {
    const booking = this.bookingService.getBookingForTimeSlot(slot.id);
    if (!booking) {
      this.errorMessageService.showError('Booking not found');
      return;
    }

    this.confirmDialogService.confirmCancelBooking().subscribe(confirmed => {
      if (confirmed) {
        this.bookingService.cancelBooking(booking.id).subscribe({
          next: () => {
            this.errorMessageService.showSuccess('Booking cancelled successfully!');
            this.loadTimeSlots(); // Refresh slots
          },
          error: (error) => {
            console.error('Failed to cancel booking:', error);
            
            let errorMessage = 'Failed to cancel booking. Please try again.';
            
            // Handle specific error responses
            if (error.error) {
              if (typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error.detail) {
                errorMessage = error.error.detail;
              } else if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error.error) {
                errorMessage = error.error.error;
              }
            }
            
            // Translate common server error messages to user-friendly text
            if (errorMessage.includes('too late to cancel')) {
              errorMessage = 'It is too late to cancel this booking. Cancellation must be done at least 1 hour before the scheduled time.';
            } else if (errorMessage.includes('Booking not found')) {
              errorMessage = 'This booking no longer exists or has already been cancelled.';
            }
            
            this.errorMessageService.showError(errorMessage);
          }
        });
      }
    });
  }
  
  private loadCategories(): void {
    // Используем статические категории из модели - не нужно загружать с сервера
    this.categories = CATEGORIES;
  }

  private initializeWeek(): void {
    // Set current week start to Monday
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Handle Sunday as 0
    this.currentWeekStart = new Date(today.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
    this.currentWeekStart.setHours(0, 0, 0, 0);
    this.updateWeekDays();
  }

  private updateWeekDays(): void {
    this.weekDays = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
      this.weekDays.push({
        name: dayNames[i],
        date: date
      });
    }
  }

  private loadTimeSlots(): void {
    if (!this.hasAnySelection) {
      this.timeSlots = [];
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
      return;
    }

    this.isLoading = true;
    
    const selectedCategories = [];
    if (this.categorySelection.cat1) selectedCategories.push('Cat 1');
    if (this.categorySelection.cat2) selectedCategories.push('Cat 2');
    if (this.categorySelection.cat3) selectedCategories.push('Cat 3');

    const startDate = this.currentWeekStart.toISOString().split('T')[0];
    const endDate = new Date(this.currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.bookingService.getTimeSlots({
      start_date: startDate,
      end_date: endDate,
      categories: selectedCategories
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (slots) => {
        this.timeSlots = slots || []; // Ensure it's always an array
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // Show message if no slots available
        if (this.timeSlots.length === 0) {
          setTimeout(() => {
            this.errorMessageService.showInfo('No time slots available for the selected week and categories.');
          }, 100);
        }
      },
      error: (error) => {
        console.error('Failed to load time slots:', error);
        this.timeSlots = [];
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessageService.showError('Failed to load time slots. Please try again.');
        }, 100);
      }
    });
  }

  private setupWebSocketConnection(): void {
    this.websocketService.connect().pipe(
      takeUntil(this.destroy$)
    ).subscribe(message => {
      if (message.type === 'booking_created' || message.type === 'booking_cancelled' || message.type === 'timeslot_created') {
        // Refresh time slots when any booking-related event occurs
        this.loadTimeSlots();
      }
    });
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayOfYear = ((today.getTime() - start.getTime()) / 86400000) + 1;
    return Math.ceil(dayOfYear / 7);
  }

  private loadSelectionFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const selection = JSON.parse(stored) as CategorySelection;
        this.categorySelection = {
          cat1: selection.cat1 ?? true,
          cat2: selection.cat2 ?? true,
          cat3: selection.cat3 ?? true
        };
      }
    } catch (error) {
      console.warn('Failed to load category selection from localStorage:', error);
      // Используем дефолтные значения (все включены)
    }
  }
  
  private saveSelectionToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categorySelection));
    } catch (error) {
      console.warn('Failed to save category selection to localStorage:', error);
    }
  }
}
