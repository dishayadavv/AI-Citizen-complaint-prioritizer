import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';


@Component({
  selector: 'app-citizen-register',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './citizen-register.html',

  styleUrl: './citizen-register.css'
})


export class CitizenRegister {


  // =====================================================
  // API
  // =====================================================

  private apiUrl =
    'http://localhost:5000/api/citizens/register';


  // =====================================================
  // FORM DATA
  // =====================================================

  citizen = {

    name: '',

    email: '',

    phone: '',

    password: '',

    confirmPassword: '',

    address: '',

    city: ''

  };


  // =====================================================
  // UI STATE
  // =====================================================

  isLoading = false;

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // REGISTER
  // =====================================================

  register(): void {


    // ---------------------------------------------------
    // CLEAR OLD MESSAGES
    // ---------------------------------------------------

    this.errorMessage = '';

    this.successMessage = '';


    // ---------------------------------------------------
    // PREVENT DOUBLE SUBMISSION
    // ---------------------------------------------------

    if (this.isLoading) {

      return;

    }


    // ===================================================
    // CLEAN INPUT
    // ===================================================

    const name =
      this.citizen.name.trim();

    const email =
      this.citizen.email
        .trim()
        .toLowerCase();

    const phone =
      this.citizen.phone
        .replace(/\s+/g, '')
        .trim();

    const password =
      this.citizen.password;

    const confirmPassword =
      this.citizen.confirmPassword;

    const address =
      this.citizen.address.trim();

    const city =
      this.citizen.city.trim();


    // ===================================================
    // REQUIRED FIELD VALIDATION
    // ===================================================

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !address ||
      !city
    ) {

      this.showError(
        'Please fill in all required fields.'
      );

      return;

    }


    // ===================================================
    // NAME VALIDATION
    // ===================================================

    if (name.length < 2) {

      this.showError(
        'Please enter your full name.'
      );

      return;

    }


    if (name.length > 80) {

      this.showError(
        'Name must be 80 characters or less.'
      );

      return;

    }


    // Allow letters, spaces, apostrophes and hyphens

    const namePattern =
      /^[A-Za-zÀ-ÿ]+(?:[\s'-][A-Za-zÀ-ÿ]+)*$/;


    if (!namePattern.test(name)) {

      this.showError(
        'Please enter a valid name.'
      );

      return;

    }


    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    const emailPattern =
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;


    if (!emailPattern.test(email)) {

      this.showError(
        'Please enter a valid email address.'
      );

      return;

    }


    if (email.length > 120) {

      this.showError(
        'Email address is too long.'
      );

      return;

    }


    // ===================================================
    // PHONE VALIDATION
    // ===================================================

    const phonePattern =
      /^[6-9][0-9]{9}$/;


    if (!phonePattern.test(phone)) {

      this.showError(
        'Please enter a valid 10-digit Indian mobile number.'
      );

      return;

    }


    // ===================================================
    // PASSWORD LENGTH
    // ===================================================

    if (password.length < 8) {

      this.showError(
        'Password must contain at least 8 characters.'
      );

      return;

    }


    if (password.length > 128) {

      this.showError(
        'Password must be 128 characters or less.'
      );

      return;

    }


    // ===================================================
    // PASSWORD STRENGTH
    // ===================================================

    const hasUppercase =
      /[A-Z]/.test(password);

    const hasLowercase =
      /[a-z]/.test(password);

    const hasNumber =
      /[0-9]/.test(password);

    const hasSpecialCharacter =
      /[^A-Za-z0-9]/.test(password);


    if (
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber ||
      !hasSpecialCharacter
    ) {

      this.showError(
        'Password must contain uppercase, lowercase, number and special character.'
      );

      return;

    }


    // ===================================================
    // CONFIRM PASSWORD
    // ===================================================

    if (
      password !==
      confirmPassword
    ) {

      this.showError(
        'Passwords do not match.'
      );

      return;

    }


    // ===================================================
    // ADDRESS VALIDATION
    // ===================================================

    if (address.length < 3) {

      this.showError(
        'Please enter a valid address.'
      );

      return;

    }


    if (address.length > 200) {

      this.showError(
        'Address must be 200 characters or less.'
      );

      return;

    }


    // ===================================================
    // CITY VALIDATION
    // ===================================================

    if (city.length < 2) {

      this.showError(
        'Please enter a valid city.'
      );

      return;

    }


    if (city.length > 80) {

      this.showError(
        'City name must be 80 characters or less.'
      );

      return;

    }


    // ===================================================
    // PREPARE REQUEST
    // ===================================================

    const data = {

      name: name,

      email: email,

      phone: phone,

      password: password,

      address: address,

      city: city

    };


    // ===================================================
    // SAFE DEBUG LOG
    // ===================================================
    // NEVER log passwords.

    console.log(
      'Registering citizen:',
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city
      }
    );


    // ===================================================
    // START LOADING
    // ===================================================

    this.isLoading = true;

    this.cdr.detectChanges();


    // ===================================================
    // API REQUEST
    // ===================================================

    this.http
      .post<any>(
        this.apiUrl,
        data
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (response) => {

          console.log(
            'Citizen registration successful.'
          );


          // ---------------------------------------------
          // STOP LOADING
          // ---------------------------------------------

          this.isLoading = false;


          // ---------------------------------------------
          // SUCCESS MESSAGE
          // ---------------------------------------------

          this.successMessage =
            'Account created successfully! You can now log in.';


          // ---------------------------------------------
          // CLEAR ERROR
          // ---------------------------------------------

          this.errorMessage = '';


          // ---------------------------------------------
          // CLEAR FORM
          // ---------------------------------------------

          this.citizen = {

            name: '',

            email: '',

            phone: '',

            password: '',

            confirmPassword: '',

            address: '',

            city: ''

          };


          // ---------------------------------------------
          // UPDATE UI
          // ---------------------------------------------

          this.cdr.detectChanges();

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Registration request failed:',
            {
              status: error.status,
              message: error.error?.message
            }
          );


          // ---------------------------------------------
          // STOP LOADING
          // ---------------------------------------------

          this.isLoading = false;


          // =============================================
          // DUPLICATE EMAIL
          // =============================================

          if (
            error.status === 409
          ) {

            this.errorMessage =
              'An account with this email already exists.';

          }


          // =============================================
          // BAD REQUEST
          // =============================================

          else if (
            error.status === 400
          ) {

            this.errorMessage =
              error.error?.message ||
              'Please check the information you entered.';

          }


          // =============================================
          // BACKEND NOT RUNNING
          // =============================================

          else if (
            error.status === 0
          ) {

            this.errorMessage =
              'Unable to connect to the backend. Please make sure the backend is running.';

          }


          // =============================================
          // SERVER ERROR
          // =============================================

          else {

            this.errorMessage =
              error.error?.message ||
              'Unable to create your account. Please try again.';

          }


          // ---------------------------------------------
          // UPDATE UI
          // ---------------------------------------------

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // ERROR HELPER
  // =====================================================

  private showError(
    message: string
  ): void {

    this.errorMessage =
      message;

    this.successMessage = '';

    this.isLoading = false;

    this.cdr.detectChanges();

  }

}