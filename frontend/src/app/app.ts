import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MaterialModule } from './material.module';
import { AuthService } from './services/auth.service';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MaterialModule, LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  showLayout = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication status and show layout accordingly
    this.authService.currentUser$.subscribe(user => {
      this.showLayout = !!user;
    });

    // Listen to route changes to handle layout visibility
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.showLayout = currentRoute !== '/login' && !!this.authService.getCurrentUser();
    });
  }
}
