import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { CategoryFilterComponent, CategorySelection, ErrorMessageService } from '../shared';
import { Category, CATEGORIES } from '../../models/category.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    CategoryFilterComponent
  ],
  template: `
    <div class="calendar-container">
      <!-- Category Filter Section -->
      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Event Categories</mat-card-title>
          <mat-card-subtitle>Select categories to filter calendar events</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-category-filter
            [selection]="categorySelection"
            [title]="'Filter Categories'"
            [subtitle]="'Choose which event categories to display'"
            [showTitle]="false"
            [horizontal]="true"
            [compact]="true"
            (selectionChange)="onCategorySelectionChange($event)">
          </app-category-filter>
          
          <div class="filter-status" *ngIf="!hasAnySelection()">
            <mat-icon color="warn">warning</mat-icon>
            <span>Select at least one category to see time slots</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Calendar Section -->
      <mat-card class="calendar-card">
        <mat-card-header>
          <mat-card-title>Weekly Calendar</mat-card-title>
          <mat-card-subtitle>Time slots for selected categories</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="!hasAnySelection()" class="no-selection-message">
            <mat-icon>event_busy</mat-icon>
            <h3>No categories selected</h3>
            <p>Please select at least one category above to see available time slots.</p>
          </div>
          
          <div *ngIf="hasAnySelection()" class="calendar-placeholder">
            <mat-icon>calendar_today</mat-icon>
            <h3>Calendar will be implemented in Stage 5-6</h3>
            <p>This will show the weekly calendar view with available time slots for:</p>
            <div class="selected-categories">
              <mat-chip-set>
                <mat-chip *ngIf="categorySelection.cat1" color="primary">Cat 1</mat-chip>
                <mat-chip *ngIf="categorySelection.cat2" color="accent">Cat 2</mat-chip>
                <mat-chip *ngIf="categorySelection.cat3" color="warn">Cat 3</mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .calendar-container {
      max-width: 1200px;
      margin: 20px auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .filter-card {
      background-color: #f5f5f5;
    }
    
    .calendar-card {
      flex: 1;
      min-height: 400px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }
    
    .filter-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      color: #f57c00;
      font-size: 14px;
    }
    
    .no-selection-message,
    .calendar-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .no-selection-message mat-icon,
    .calendar-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: rgba(0, 0, 0, 0.3);
    }
    
    .selected-categories {
      margin-top: 16px;
    }
    
    @media (max-width: 768px) {
      .calendar-container {
        margin: 10px;
        gap: 16px;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  categorySelection: CategorySelection = {
    cat1: true, // По умолчанию все категории включены
    cat2: true,
    cat3: true
  };
  
  categories: Category[] = [];
  
  private readonly STORAGE_KEY = 'calendar_category_filter';
  
  constructor(
    private errorMessageService: ErrorMessageService
  ) {}
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadSelectionFromStorage();
  }
  
  hasAnySelection(): boolean {
    return this.categorySelection.cat1 || this.categorySelection.cat2 || this.categorySelection.cat3;
  }
  
  onCategorySelectionChange(selection: CategorySelection): void {
    this.categorySelection = { ...selection };
    this.saveSelectionToStorage();
  }
  
  private loadCategories(): void {
    // Используем статические категории из модели - не нужно загружать с сервера
    this.categories = CATEGORIES;
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
