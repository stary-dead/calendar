import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, filter, take, combineLatest } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Ждем пока завершится проверка авторизации
    return combineLatest([
      this.authService.currentUser$,
      this.authService.authCheckComplete$
    ]).pipe(
      filter(([user, checkComplete]) => checkComplete), // Ждем завершения проверки
      take(1), // Берем только первый результат
      map(([user, checkComplete]) => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
