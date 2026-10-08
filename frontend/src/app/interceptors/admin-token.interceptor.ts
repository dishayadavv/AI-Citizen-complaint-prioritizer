import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  inject
} from '@angular/core';

import {
  catchError,
  throwError
} from 'rxjs';


export const adminTokenInterceptor: HttpInterceptorFn =
  (req, next) => {

    const router = inject(Router);

    const token =
      localStorage.getItem(
        'cityfixAdminToken'
      );

    let authenticatedRequest = req;

    /*
     * Add JWT token to the request
     * when an admin token exists.
     */
    if (
      token &&
      token.trim()
    ) {

      authenticatedRequest =
        req.clone({
          setHeaders: {
            Authorization:
              `Bearer ${token}`
          }
        });

    }


    return next(
      authenticatedRequest
    ).pipe(

      catchError(
        (error: HttpErrorResponse) => {

          /*
           * If the backend says the admin
           * authentication is invalid or expired,
           * clear the admin session and return to login.
           */
          if (
            error.status === 401 ||
            error.status === 403
          ) {

            const currentUrl =
              router.url;

            /*
             * Only perform admin logout when
             * the user is currently inside an
             * admin section.
             */
            if (
              currentUrl.startsWith('/admin-')
            ) {

              console.warn(
                'Admin session expired or is invalid. Logging out.'
              );

              localStorage.removeItem(
                'cityfixAdminToken'
              );

              localStorage.removeItem(
                'cityfixAdmin'
              );

              localStorage.removeItem(
                'cityfixAdminEmail'
              );

              router.navigate([
                '/admin-login'
              ]);

            }

          }

          return throwError(
            () => error
          );

        }
      )

    );

  };