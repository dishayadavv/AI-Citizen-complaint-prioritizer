import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  email = '';
  password = '';

  errorMessage = '';
  isLoading = false;

  private apiUrl =
    'http://localhost:5000/api/admin/login';


  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  login(): void {

    this.errorMessage = '';

    const email =
      this.email.trim().toLowerCase();

    const password =
      this.password;


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !password) {

      this.errorMessage =
        'Please enter your email and password.';

      return;
    }


    this.isLoading = true;


    // -------------------------------------------------
    // BACKEND LOGIN
    // -------------------------------------------------

    this.http
      .post<any>(
        this.apiUrl,
        {
          email,
          password
        }
      )
      .subscribe({

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        next: (response) => {

          console.log(
            'Admin login successful.'
          );


          // ---------------------------------------------
          // SAVE JWT TOKEN
          // ---------------------------------------------

          if (response.token) {

            localStorage.setItem(
              'cityfixAdminToken',
              response.token
            );

          }


          // ---------------------------------------------
          // SAVE ADMIN INFORMATION
          // ---------------------------------------------

          if (
            response.admin &&
            response.admin.email
          ) {

            localStorage.setItem(
              'cityfixAdminEmail',
              response.admin.email
            );

          }
          else {

            localStorage.setItem(
              'cityfixAdminEmail',
              email
            );

          }


          // ---------------------------------------------
          // KEEP ADMIN LOGIN FLAG
          // ---------------------------------------------
          // This will be removed later when we finish
          // converting the guard completely to JWT.

          localStorage.setItem(
            'cityfixAdmin',
            'true'
          );


          this.isLoading = false;


          // ---------------------------------------------
          // GO TO ADMIN DASHBOARD
          // ---------------------------------------------

          this.router.navigate([
            '/admin-dashboard'
          ]);

        },


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        error: (error) => {

          console.error(
            'Admin login error:',
            error
          );


          this.isLoading = false;


          if (error.status === 401) {

            this.errorMessage =
              'Invalid admin email or password.';

          }

          else if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'Please enter a valid email and password.';

          }

          else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend. Please make sure the server is running.';

          }

          else {

            this.errorMessage =
              error.error?.message ||
              'Something went wrong. Please try again.';

          }

        }

      });

  }

}