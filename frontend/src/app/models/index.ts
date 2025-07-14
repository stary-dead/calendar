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

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface Booking {
  id: number;
  time_slot: TimeSlot;
  booked_at: string;
  can_cancel: boolean;
}

export interface UserPreferences {
  cat_1: boolean;
  cat_2: boolean;
  cat_3: boolean;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
}
