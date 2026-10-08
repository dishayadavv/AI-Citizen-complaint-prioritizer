import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';


@Component({

  selector: 'app-citizen-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './citizen-login.html',

  styleUrl: './citizen-login.css'

})


export class CitizenLogin {


  /* =====================================================
     API URL
  ====================================================== */

  private apiUrl =
    'http://localhost:5000/api/citizens/login';


  /* =====================================================
     LOGIN DATA
  ====================================================== */

  loginData = {

    email: '',

    password: ''

  };


  /* =====================================================
     UI STATES
  ====================================================== */

  isLoading = false;

  errorMessage = '';

  successMessage = '';


  /* =====================================================
     CONSTRUCTOR
  ====================================================== */

  constructor(

    private http: HttpClient,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  /* =====================================================
     LOGIN
  ====================================================== */

  login(): void {


    /* -----------------------------------------------------
       CLEAR PREVIOUS MESSAGES
    ----------------------------------------------------- */

    this.errorMessage = '';

    this.successMessage = '';


    /* -----------------------------------------------------
       GET FORM VALUES
    ----------------------------------------------------- */

    const email =
      this.loginData.email
        .trim()
        .toLowerCase();

    const password =
      this.loginData.password;


    /* -----------------------------------------------------
       EMAIL REQUIRED
    ----------------------------------------------------- */

    if (!email) {

      this.errorMessage =
        'Please enter your email address.';

      return;

    }


    /* -----------------------------------------------------
       PASSWORD REQUIRED
    ----------------------------------------------------- */

    if (!password) {

      this.errorMessage =
        'Please enter your password.';

      return;

    }


    /* -----------------------------------------------------
       EMAIL FORMAT
    ----------------------------------------------------- */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

      this.errorMessage =
        'Please enter a valid email address.';

      return;

    }


    /* -----------------------------------------------------
       START LOADING
    ----------------------------------------------------- */

    this.isLoading = true;


    /* -----------------------------------------------------
       SEND LOGIN REQUEST
    ----------------------------------------------------- */

    this.http.post<any>(

      this.apiUrl,

      {

        email: email,

        password: password

      }

    ).subscribe({

      /* ===================================================
         SUCCESS
      ================================================== */

      next: (response) => {


        console.log(
          'Citizen login successful.'
        );


        this.isLoading = false;

        this.errorMessage = '';

        this.successMessage =
          'Redirecting you to your dashboard...';


        /* -------------------------------------------------
           GET CITIZEN DATA
        ------------------------------------------------- */

        const citizen =
          response?.citizen ||
          response?.user ||
          response;


        /* -------------------------------------------------
           STORE CITIZEN DATA
        ------------------------------------------------- */

        if (citizen) {


          localStorage.setItem(

            'citizen',

            JSON.stringify(citizen)

          );


          localStorage.setItem(

            'cityfixCitizen',

            JSON.stringify(citizen)

          );


          /* -----------------------------------------------
             STORE EMAIL
          ----------------------------------------------- */

          if (citizen.email) {

            localStorage.setItem(

              'citizenEmail',

              citizen.email

            );

          }


          /* -----------------------------------------------
             STORE CITIZEN ID
          ----------------------------------------------- */

          if (citizen._id) {

            localStorage.setItem(

              'cityfixCitizenId',

              citizen._id

            );

          }

        }

        else {


          /* -----------------------------------------------
             FALLBACK EMAIL
          ----------------------------------------------- */

          localStorage.setItem(

            'citizenEmail',

            email

          );

        }


        /* -------------------------------------------------
           UPDATE UI
        ------------------------------------------------- */

        this.cdr.detectChanges();


        /* -------------------------------------------------
           GO TO DASHBOARD
        ------------------------------------------------- */

        setTimeout(() => {

          this.router.navigate([
            '/citizen-dashboard'
          ]);

        }, 700);

      },


      /* ===================================================
         ERROR
      ================================================== */

      error: (error: HttpErrorResponse) => {


        console.error(
          'Citizen login error:',
          error
        );


        this.isLoading = false;


        /* -------------------------------------------------
           INVALID LOGIN
        ------------------------------------------------- */

        if (error.status === 401) {

          this.errorMessage =
            'Invalid email or password. Please try again.';

        }


        /* -------------------------------------------------
           ACCOUNT INACTIVE
        ------------------------------------------------- */

        else if (error.status === 403) {

          this.errorMessage =
            'Your account is currently inactive.';

        }


        /* -------------------------------------------------
           BAD REQUEST
        ------------------------------------------------- */

        else if (error.status === 400) {

          this.errorMessage =
            error.error?.message ||
            'Please check your login details.';

        }


        /* -------------------------------------------------
           BACKEND NOT RUNNING
        ------------------------------------------------- */

        else if (error.status === 0) {

          this.errorMessage =
            'Unable to connect to CityFix server. Please make sure the backend is running on port 5000.';

        }


        /* -------------------------------------------------
           OTHER ERROR
        ------------------------------------------------- */

        else {

          this.errorMessage =
            error.error?.message ||
            'Something went wrong. Please try again.';

        }


        this.cdr.detectChanges();

      }

    });

  }

}