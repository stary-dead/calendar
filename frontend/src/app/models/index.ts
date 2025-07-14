export interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  categoryId: number;
  categoryCode: 'cat1' | 'cat2' | 'cat3';
  isBooked: boolean;
  bookedByCurrentUser?: boolean;
  bookedBy?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface Booking {
  id: number;
  timeSlot: TimeSlot;
  user: User;
  createdAt: string;
}

export interface UserPreferences {
  cat1: boolean;
  cat2: boolean;
  cat3: boolean;
}
