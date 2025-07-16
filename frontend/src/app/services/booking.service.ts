import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, filter } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebSocketService, WebSocketMessage } from './websocket.service';
import { CsrfService } from './csrf.service';

export interface TimeSlot {
  id: number;
  category: number;
  category_name: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
  can_book: boolean;
  created_by: number;
  created_at: string;
}

export interface Booking {
  id: number;
  time_slot: TimeSlot;
  booked_at: string;
  can_cancel: boolean;
}

export interface CreateBookingRequest {
  time_slot: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private userBookingsSubject = new BehaviorSubject<Booking[]>([]);
  public userBookings$ = this.userBookingsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private websocketService: WebSocketService,
    private csrfService: CsrfService
  ) {
    this.setupWebSocketListeners();
  }

  /**
   * Create a new booking
   */
  createBooking(timeSlotId: number): Observable<Booking> {
    const request: CreateBookingRequest = {
      time_slot: timeSlotId
    };

    return this.http.post<Booking>(`${environment.apiUrl}/api/bookings/`, request, { 
      headers: this.csrfService.getHeaders(),
      withCredentials: true 
    }).pipe(
      tap(() => {
        // Refresh user bookings after successful creation
        this.loadUserBookings();
      })
    );
  }

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/bookings/${bookingId}/`, { 
      headers: this.csrfService.getHeaders(),
      withCredentials: true 
    }).pipe(
      tap(() => {
        // Refresh user bookings after successful cancellation
        this.loadUserBookings();
      })
    );
  }

  /**
   * Get user's bookings
   */
  getUserBookings(status?: 'upcoming' | 'past'): Observable<Booking[]> {
    let params: any = {};
    if (status) {
      params.status = status;
    }

    return this.http.get<Booking[]>(`${environment.apiUrl}/api/user/bookings/`, { params, withCredentials: true }).pipe(
      tap(bookings => {
        this.userBookingsSubject.next(bookings);
      })
    );
  }

  /**
   * Get time slots with optional filtering
   */
  getTimeSlots(filters?: {
    date?: string;
    start_date?: string;
    end_date?: string;
    categories?: string[];
    available_only?: boolean;
  }): Observable<TimeSlot[]> {
    let params = new URLSearchParams();
    
    if (filters) {
      if (filters.date) params.append('date', filters.date);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.categories && filters.categories.length > 0) {
        // Передаём каждую категорию как отдельный параметр categories
        filters.categories.forEach(category => {
          params.append('categories', category);
        });
      }
      if (filters.available_only) params.append('available_only', 'true');
    }

    return this.http.get<TimeSlot[]>(`${environment.apiUrl}/api/timeslots/?${params.toString()}`, { withCredentials: true });
  }

  /**
   * Load user bookings and cache them
   */
  loadUserBookings(): void {
    this.getUserBookings().subscribe({
      next: (bookings) => {
        this.userBookingsSubject.next(bookings);
      },
      error: (error) => {
        console.error('Failed to load user bookings:', error);
      }
    });
  }

  /**
   * Get cached user bookings
   */
  getCachedUserBookings(): Booking[] {
    return this.userBookingsSubject.value;
  }

  /**
   * Check if user has booked a specific time slot
   */
  isTimeSlotBookedByUser(timeSlotId: number): boolean {
    return this.userBookingsSubject.value.some(booking => 
      booking.time_slot.id === timeSlotId
    );
  }

  /**
   * Get booking for a specific time slot if exists
   */
  getBookingForTimeSlot(timeSlotId: number): Booking | undefined {
    return this.userBookingsSubject.value.find(booking => 
      booking.time_slot.id === timeSlotId
    );
  }

  /**
   * Clear cached bookings (e.g., on logout)
   */
  clearBookings(): void {
    this.userBookingsSubject.next([]);
  }

  /**
   * Setup WebSocket listeners for real-time updates
   */
  private setupWebSocketListeners(): void {
    this.websocketService.messages$.pipe(
      filter(message => this.isBookingRelatedMessage(message))
    ).subscribe(message => {
      this.handleWebSocketMessage(message);
    });
  }

  /**
   * Check if WebSocket message is booking-related
   */
  private isBookingRelatedMessage(message: WebSocketMessage): boolean {
    return ['booking_created', 'booking_cancelled'].includes(message.type);
  }

  /**
   * Handle WebSocket messages for real-time updates
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'booking_created':
        this.handleBookingCreated(message.data);
        break;
      case 'booking_cancelled':
        this.handleBookingCancelled(message.data);
        break;
    }
  }

  /**
   * Handle booking created WebSocket event
   */
  private handleBookingCreated(data: any): void {
    // Refresh user bookings to get the latest state
    this.loadUserBookings();
  }

  /**
   * Handle booking cancelled WebSocket event
   */
  private handleBookingCancelled(data: any): void {
    // Refresh user bookings to get the latest state
    this.loadUserBookings();
  }
}
