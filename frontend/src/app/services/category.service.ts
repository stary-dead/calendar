import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  /**
   * Get all available categories (Cat 1, Cat 2, Cat 3)
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/api/categories/`);
  }

  /**
   * Load categories and cache them in BehaviorSubject
   */
  private loadCategories(): void {
    this.getCategories().subscribe({
      next: (categories) => {
        this.categoriesSubject.next(categories);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        // Set default categories if API fails
        this.categoriesSubject.next([
          { id: 1, name: 'Cat 1' },
          { id: 2, name: 'Cat 2' },
          { id: 3, name: 'Cat 3' }
        ]);
      }
    });
  }

  /**
   * Get cached categories synchronously
   */
  getCachedCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: number): Category | undefined {
    return this.categoriesSubject.value.find(cat => cat.id === id);
  }

  /**
   * Get category by name
   */
  getCategoryByName(name: string): Category | undefined {
    return this.categoriesSubject.value.find(cat => cat.name === name);
  }

  /**
   * Force reload categories from API
   */
  refreshCategories(): void {
    this.loadCategories();
  }
}
