import {
  CanActivateFn,
  Router
} from '@angular/router';

import { inject } from '@angular/core';


export const citizenAuthGuard: CanActivateFn = () => {

  const router = inject(Router);


  // =====================================================
  // CHECK CITIZEN EMAIL
  // =====================================================

  const citizenEmail =
    localStorage.getItem('citizenEmail');


  if (
    citizenEmail &&
    citizenEmail.trim()
  ) {

    return true;

  }


  // =====================================================
  // CHECK CITIZEN DATA
  // =====================================================

  const citizenData =
    localStorage.getItem('cityfixCitizen') ||
    localStorage.getItem('citizen');


  if (citizenData) {

    try {

      const citizen =
        JSON.parse(citizenData);


      if (
        citizen &&
        citizen.email &&
        citizen.email.trim()
      ) {

        return true;

      }

    } catch (error) {

      console.warn(
        'Invalid citizen login data found.'
      );

    }

  }


  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  return router.createUrlTree([
    '/citizen-login'
  ]);

};