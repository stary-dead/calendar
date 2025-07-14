import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'preferences',
    loadComponent: () => import('./components/user/preferences/preferences.component').then(m => m.PreferencesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'timeslots',
        pathMatch: 'full'
      },
      {
        path: 'timeslots',
        loadComponent: () => import('./components/admin/timeslots/timeslots.component').then(m => m.TimeslotsComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./components/admin/bookings/bookings.component').then(m => m.BookingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
