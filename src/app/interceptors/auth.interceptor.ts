import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (request.url.includes('/api/login_check')) {
      return next.handle(request);
    }


    if (token) {
      let cloned;
      if(request.url.includes('/api/players/import')){
        cloned = request.clone({   
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json, application/ld+json'

          },
  
        });
      }else{
        cloned = request.clone({   
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/ld+json',
            'Accept': 'application/ld+json, application/json',
          },
  
        });
      }
 

      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('HTTP Error in interceptor:', error);

          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }

          return throwError(() => error);
        })
      );
    }

    if (request.url.includes('/api/') && !request.url.includes('/api/login_check')) {
      this.router.navigate(['/login']);
    }

    return next.handle(request);
  }
}
