import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './citizen-dashboard.html',
  styleUrl: './citizen-dashboard.css'
})
export class CitizenDashboard {

  citizen: any = null;

  complaints: any[] = [];

  isLoading = true;

  errorMessage = '';

  private apiUrl =
    'http://localhost:5000/api/complaints';


  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {

    this.loadCitizen();

    this.loadComplaints();

  }


  // =====================================================
  // LOAD CITIZEN
  // =====================================================

  loadCitizen(): void {

    const savedCitizen =
      localStorage.getItem('cityfixCitizen') ||
      localStorage.getItem('citizen');


    if (savedCitizen) {

      try {

        this.citizen =
          JSON.parse(savedCitizen);

      }

      catch (error) {

        console.error(
          'Unable to read citizen information:',
          error
        );

      }

    }

  }


  // =====================================================
  // GET CITIZEN NAME
  // =====================================================

  get citizenName(): string {

    return this.citizen?.name ||
      'Citizen';

  }


  // =====================================================
  // GET CITIZEN CITY
  // =====================================================

  get citizenCity(): string {

    return this.citizen?.city ||
      'Your City';

  }


  // =====================================================
  // GET CITIZEN EMAIL
  // =====================================================

  get citizenEmail(): string {

    return (
      this.citizen?.email ||
      localStorage.getItem('citizenEmail') ||
      ''
    );

  }


  // =====================================================
  // LOAD CITIZEN COMPLAINTS
  // =====================================================

  loadComplaints(): void {

    this.errorMessage = '';

    const email =
      this.citizenEmail
        .trim()
        .toLowerCase();


    if (!email) {

      console.warn(
        'Citizen email not found.'
      );

      this.complaints = [];

      this.isLoading = false;

      this.cdr.detectChanges();

      return;

    }


    console.log(
      'Loading dashboard complaints for:',
      email
    );


    this.http
      .get<any[]>(
        `${this.apiUrl}/citizen/${encodeURIComponent(email)}`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'DASHBOARD COMPLAINTS RESPONSE:',
            response
          );


          this.complaints =
            Array.isArray(response)
              ? response
              : [];


          this.isLoading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'DASHBOARD COMPLAINTS ERROR:',
            error
          );


          this.complaints = [];

          this.isLoading = false;


          if (error?.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend.';

          }

          else {

            this.errorMessage =
              error?.error?.message ||
              'Unable to load your complaints.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // TOTAL REPORTS
  // =====================================================

  get totalReports(): number {

    return this.complaints.length;

  }


  // =====================================================
  // PENDING COMPLAINTS
  // =====================================================

  get pendingReports(): number {

    return this.complaints.filter(
      complaint =>
        complaint?.status === 'Pending'
    ).length;

  }


  // =====================================================
  // IN PROGRESS COMPLAINTS
  // =====================================================

  get inProgressReports(): number {

    return this.complaints.filter(
      complaint =>
        complaint?.status === 'In Progress'
    ).length;

  }


  // =====================================================
  // RESOLVED COMPLAINTS
  // =====================================================

  get resolvedReports(): number {

    return this.complaints.filter(
      complaint =>
        complaint?.status === 'Resolved'
    ).length;

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem(
      'citizen'
    );

    localStorage.removeItem(
      'citizenEmail'
    );

    localStorage.removeItem(
      'cityfixCitizen'
    );

    localStorage.removeItem(
      'cityfixCitizenId'
    );


    this.router.navigate([
      '/'
    ]);

  }

}