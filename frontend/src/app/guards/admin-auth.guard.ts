import {
  CanActivateFn,
  Router
} from '@angular/router';

import { inject } from '@angular/core';

export const adminAuthGuard: CanActivateFn = () => {

  const router = inject(Router);

  // =====================================================
  // GET JWT TOKEN
  // =====================================================

  const token =
    localStorage.getItem('cityfixAdminToken');


  // =====================================================
  // NO TOKEN
  // =====================================================

  if (!token || !token.trim()) {

    return router.createUrlTree([
      '/admin-login'
    ]);

  }


  // =====================================================
  // CHECK TOKEN EXPIRATION
  // =====================================================

  try {

    const tokenParts =
      token.split('.');


    // A JWT must contain:
    // Header.Payload.Signature

    if (tokenParts.length !== 3) {

      localStorage.removeItem(
        'cityfixAdminToken'
      );

      localStorage.removeItem(
        'cityfixAdmin'
      );

      localStorage.removeItem(
        'cityfixAdminEmail'
      );

      return router.createUrlTree([
        '/admin-login'
      ]);

    }


    // -------------------------------------------------
    // Decode JWT payload
    // -------------------------------------------------

    const payload =
      JSON.parse(
        atob(
          tokenParts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );


    // -------------------------------------------------
    // Check expiration
    // -------------------------------------------------

    if (
      payload.exp &&
      Date.now() >= payload.exp * 1000
    ) {

      console.warn(
        'Admin session has expired.'
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


      return router.createUrlTree([
        '/admin-login'
      ]);

    }


    // -------------------------------------------------
    // Check admin role
    // -------------------------------------------------

    if (
      payload.role !== 'admin'
    ) {

      localStorage.removeItem(
        'cityfixAdminToken'
      );

      localStorage.removeItem(
        'cityfixAdmin'
      );

      localStorage.removeItem(
        'cityfixAdminEmail'
      );


      return router.createUrlTree([
        '/admin-login'
      ]);

    }


    // =================================================
    // ADMIN AUTHENTICATED
    // =================================================

    return true;

  }

  catch (error) {

    console.error(
      'Invalid admin authentication token.',
      error
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


    return router.createUrlTree([
      '/admin-login'
    ]);

  }

};