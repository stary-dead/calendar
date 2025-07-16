import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TimeSlot, Booking } from '../models';
import { CsrfService } from './csrf.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private csrfService: CsrfService
  ) {}

  // TimeSlots
  getTimeSlots(startDate?: string, endDate?: string, categories?: string[]): Observable<TimeSlot[]> {
    let params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (categories && categories.length > 0) params.categories = categories.join(',');

    return this.http.get<TimeSlot[]>(`${environment.apiUrl}/api/timeslots/`, { 
      params,
      withCredentials: true
    });
  }

  // Bookings
  createBooking(timeSlotId: number): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/api/bookings/`, {
      time_slot: timeSlotId
    }, {
      headers: this.csrfService.getHeaders(),
      withCredentials: true
    });
  }

  cancelBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/bookings/${bookingId}/`, {
      headers: this.csrfService.getHeaders(),
      withCredentials: true
    });
  }

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/api/user/bookings/`, {
      withCredentials: true
    });
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories/`, {
      withCredentials: true
    });
  }

  // Admin endpoints
  createTimeSlot(timeSlot: any): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(`${environment.apiUrl}/api/admin/timeslots/`, timeSlot, {
      headers: this.csrfService.getHeaders(),
      withCredentials: true
    });
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/api/admin/bookings/`, {
      withCredentials: true
    });
  }

  deleteTimeSlot(timeSlotId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/timeslots/${timeSlotId}/`, {
      headers: this.csrfService.getHeaders(),
      withCredentials: true
    });
  }

  // Admin cancel any booking
  adminCancelBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/bookings/${bookingId}/`, {
      headers: this.csrfService.getHeaders(),
      withCredentials: true
    });
  }

  // Get detailed booking information for a time slot (admin only)
  getTimeSlotBookingDetails(timeSlotId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/admin/timeslots/${timeSlotId}/booking-details/`, {
      withCredentials: true
    });
  }
}
