import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>User Preferences</mat-card-title>
        <mat-card-subtitle>Select event categories you're interested in</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>User preferences component will be implemented in Stage 5.</p>
        <p>Users will be able to select from: Cat 1, Cat 2, Cat 3</p>
        
        <div class="category-preview">
          <h4>Categories:</h4>
          <mat-chip-set>
            <mat-chip>Cat 1</mat-chip>
            <mat-chip>Cat 2</mat-chip>
            <mat-chip>Cat 3</mat-chip>
          </mat-chip-set>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 600px;
      margin: 20px auto;
    }
    
    .category-preview {
      margin-top: 20px;
      
      h4 {
        margin-bottom: 12px;
      }
    }
  `]
})
export class PreferencesComponent {}
