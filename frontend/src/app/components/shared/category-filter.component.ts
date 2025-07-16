import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Category, CATEGORIES } from '../../models/category.model';

export interface CategorySelection {
  cat1: boolean;
  cat2: boolean;
  cat3: boolean;
}

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCheckboxModule, 
    MatCardModule, 
    MatChipsModule
  ],
  template: `
    <mat-card class="category-filter-card" [ngClass]="{ 'compact': compact }">
      <mat-card-header *ngIf="showTitle">
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle">{{ subtitle }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="category-checkboxes" [ngClass]="{ 'horizontal': horizontal }">
          <mat-checkbox
            *ngFor="let category of categories"
            [checked]="getSelectionValue(category.code)"
            (change)="onCategoryChange(category.code, $event.checked)"
            [color]="'primary'"
            class="category-checkbox">
            
            <div class="category-label">
              <mat-chip 
                [style.background-color]="category.color"
                [style.color]="getChipTextColor(category.color)"
                class="category-chip">
                {{ category.name }}
              </mat-chip>
            </div>
          </mat-checkbox>
        </div>
        
        <div *ngIf="showSelectedCount" class="selected-info">
          <small>{{ getSelectedCount() }} of {{ categories.length }} categories selected</small>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .category-filter-card {
      margin-bottom: 16px;
    }

    .category-filter-card.compact {
      margin-bottom: 8px;
    }

    .category-filter-card.compact mat-card-content {
      padding: 12px 16px;
    }

    .category-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-checkboxes.horizontal {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 16px;
    }

    .category-checkbox {
      align-items: center;
    }

    .category-label {
      display: flex;
      align-items: center;
      margin-left: 8px;
    }

    .category-chip {
      font-weight: 500;
      font-size: 12px;
      min-height: 24px;
      line-height: 24px;
    }

    .selected-info {
      margin-top: 12px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 600px) {
      .category-checkboxes.horizontal {
        flex-direction: column;
      }
    }
  `]
})
export class CategoryFilterComponent implements OnInit {
  @Input() title: string = 'Select Categories';
  @Input() subtitle: string = '';
  @Input() showTitle: boolean = true;
  @Input() showSelectedCount: boolean = false;
  @Input() horizontal: boolean = false;
  @Input() compact: boolean = false;
  @Input() selection: CategorySelection = { cat1: true, cat2: true, cat3: true };
  
  @Output() selectionChange = new EventEmitter<CategorySelection>();
  @Output() selectedCategoriesChange = new EventEmitter<string[]>();

  categories: Category[] = CATEGORIES;

  ngOnInit(): void {
    // Emit initial selection
    this.emitChanges();
  }

  getSelectionValue(categoryCode: 'cat1' | 'cat2' | 'cat3'): boolean {
    return this.selection[categoryCode] || false;
  }

  onCategoryChange(categoryCode: 'cat1' | 'cat2' | 'cat3', checked: boolean): void {
    this.selection = {
      ...this.selection,
      [categoryCode]: checked
    };
    
    this.emitChanges();
  }

  getSelectedCount(): number {
    return Object.values(this.selection).filter(selected => selected).length;
  }

  getSelectedCategories(): string[] {
    return Object.entries(this.selection)
      .filter(([_, selected]) => selected)
      .map(([code, _]) => code);
  }

  getChipTextColor(backgroundColor: string): string {
    // Simple contrast calculation for text color
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 140 ? '#000000' : '#ffffff';
  }

  private emitChanges(): void {
    this.selectionChange.emit(this.selection);
    this.selectedCategoriesChange.emit(this.getSelectedCategories());
  }
}
