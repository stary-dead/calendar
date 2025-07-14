import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserPreferences {
  cat_1: boolean;
  cat_2: boolean;
  cat_3: boolean;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private preferencesSubject = new BehaviorSubject<UserPreferences | null>(null);
  public preferences$ = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get user preferences from API
   */
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${environment.apiUrl}/api/user/preferences/`).pipe(
      tap(preferences => {
        this.preferencesSubject.next(preferences);
      })
    );
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${environment.apiUrl}/api/user/preferences/`, preferences).pipe(
      tap(updatedPreferences => {
        this.preferencesSubject.next(updatedPreferences);
      })
    );
  }

  /**
   * Get cached preferences synchronously
   */
  getCachedPreferences(): UserPreferences | null {
    return this.preferencesSubject.value;
  }

  /**
   * Check if user has selected any categories
   */
  hasSelectedCategories(): boolean {
    const prefs = this.preferencesSubject.value;
    if (!prefs) return false;
    return prefs.cat_1 || prefs.cat_2 || prefs.cat_3;
  }

  /**
   * Get selected category names as array
   */
  getSelectedCategories(): string[] {
    const prefs = this.preferencesSubject.value;
    if (!prefs) return [];
    
    const selected: string[] = [];
    if (prefs.cat_1) selected.push('Cat 1');
    if (prefs.cat_2) selected.push('Cat 2');
    if (prefs.cat_3) selected.push('Cat 3');
    
    return selected;
  }

  /**
   * Check if specific category is selected
   */
  isCategorySelected(categoryName: string): boolean {
    const prefs = this.preferencesSubject.value;
    if (!prefs) return false;
    
    switch (categoryName) {
      case 'Cat 1':
        return prefs.cat_1;
      case 'Cat 2':
        return prefs.cat_2;
      case 'Cat 3':
        return prefs.cat_3;
      default:
        return false;
    }
  }

  /**
   * Set preferences for a specific category
   */
  setCategoryPreference(categoryName: string, selected: boolean): Observable<UserPreferences> {
    const currentPrefs = this.preferencesSubject.value || {
      cat_1: false,
      cat_2: false,
      cat_3: false
    };

    const updatedPrefs = { ...currentPrefs };
    
    switch (categoryName) {
      case 'Cat 1':
        updatedPrefs.cat_1 = selected;
        break;
      case 'Cat 2':
        updatedPrefs.cat_2 = selected;
        break;
      case 'Cat 3':
        updatedPrefs.cat_3 = selected;
        break;
    }

    return this.updateUserPreferences(updatedPrefs);
  }

  /**
   * Clear cached preferences (e.g., on logout)
   */
  clearPreferences(): void {
    this.preferencesSubject.next(null);
  }
}
