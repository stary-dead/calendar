import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private csrfService: CsrfService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add CSRF token to POST/PUT/DELETE requests if not already present
    if (this.shouldAddCsrfToken(req)) {
      req = this.addCsrfToken(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this.isCsrfError(error)) {
          return this.handle403Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldAddCsrfToken(req: HttpRequest<any>): boolean {
    // Add CSRF token to POST, PUT, DELETE, PATCH requests
    const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
    const hasToken = req.headers.has('X-CSRFToken');
    const isApiRequest = req.url.includes('/api/');
    
    return needsCsrf && !hasToken && isApiRequest;
  }

  private addCsrfToken(req: HttpRequest<any>): HttpRequest<any> {
    const csrfToken = this.csrfService.getCurrentToken();
    if (csrfToken) {
      return req.clone({
        headers: req.headers.set('X-CSRFToken', csrfToken)
      });
    }
    return req;
  }

  private isCsrfError(error: HttpErrorResponse): boolean {
    return error.status === 403 && 
           error.error?.detail?.includes('CSRF');
  }

  private handle403Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.csrfService.refreshToken().pipe(
        switchMap((token: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          
          // Retry the original request with the new token
          const newRequest = request.clone({
            headers: request.headers.set('X-CSRFToken', token)
          });
          
          return next.handle(newRequest);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          return throwError(() => error);
        })
      );
    } else {
      // If we're already refreshing, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          const newRequest = request.clone({
            headers: request.headers.set('X-CSRFToken', token)
          });
          return next.handle(newRequest);
        })
      );
    }
  }
}
