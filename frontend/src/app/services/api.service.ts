import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TimeSlot, Booking } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  // TimeSlots
  getTimeSlots(startDate?: string, endDate?: string, categories?: string[]): Observable<TimeSlot[]> {
    let params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (categories && categories.length > 0) params.categories = categories.join(',');

    return this.http.get<TimeSlot[]>(`${environment.apiUrl}/api/timeslots/`, { params });
  }

  // Bookings
  createBooking(timeSlotId: number): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/api/bookings/`, {
      time_slot_id: timeSlotId
    });
  }

  cancelBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/bookings/${bookingId}/`);
  }

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/api/user/bookings/`);
  }

  // User Preferences
  getUserPreferences(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/user/preferences/`);
  }

  updateUserPreferences(preferences: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/user/preferences/`, preferences);
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories/`);
  }

  // Admin endpoints
  createTimeSlot(timeSlot: any): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(`${environment.apiUrl}/api/admin/timeslots/`, timeSlot);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiUrl}/api/admin/bookings/`);
  }

  deleteTimeSlot(timeSlotId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/timeslots/${timeSlotId}/`);
  }
}
