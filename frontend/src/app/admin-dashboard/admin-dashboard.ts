import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';


// =====================================================
// LOCATION
// =====================================================

interface ComplaintLocation {

  address?: string;

  latitude?: number;

  longitude?: number;

}


// =====================================================
// COMPLAINT
// =====================================================

interface Complaint {

  _id?: string;

  title?: string;

  description?: string;

  category?: string;

  severity?: number;

  priorityScore?: number;

  priorityLevel?: string;

  aiScore?: number;

  aiLevel?: string;

  aiReasons?: string[];

  similarComplaints?: number;

  predictedResolutionTime?: number;

  status?: string;

  location?: ComplaintLocation;

  createdAt?: string;

  updatedAt?: string;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-admin-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './admin-dashboard.html',

  styleUrl: './admin-dashboard.css'

})


export class AdminDashboardComponent
  implements OnInit {


  // ===================================================
  // DATA
  // ===================================================

  complaints: Complaint[] = [];

  recentComplaints: Complaint[] = [];

  categories: {
    name: string;
    count: number;
  }[] = [];


  // ===================================================
  // LOADING
  // ===================================================

  isLoading = true;

  errorMessage = '';


  // ===================================================
  // API
  // ===================================================

  private apiUrl =
    'http://localhost:5000/api/complaints';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef,

    private router: Router

  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  loadDashboard(): void {

    this.isLoading = true;

    this.errorMessage = '';


    console.log('=================================');

    console.log('CITYFIX DASHBOARD');

    console.log('Loading complaints...');

    console.log('API:', this.apiUrl);

    console.log('=================================');


    this.http
      .get<Complaint[]>(this.apiUrl)

      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (data: Complaint[]) => {

          console.log(
            'Dashboard API response:',
            data
          );


          console.log(
            'Number of complaints:',
            data?.length
          );


          // -------------------------------------------
          // CHECK RESPONSE
          // -------------------------------------------

          if (Array.isArray(data)) {

            this.complaints = data;

          }

          else {

            console.error(
              'Unexpected API response:',
              data
            );

            this.complaints = [];

          }


          // -------------------------------------------
          // PREPARE DASHBOARD DATA
          // -------------------------------------------

          this.prepareDashboardData();


          // -------------------------------------------
          // STOP LOADING
          // -------------------------------------------

          this.isLoading = false;


          // -------------------------------------------
          // UPDATE UI
          // -------------------------------------------

          this.cdr.detectChanges();


          console.log(
            'Dashboard data prepared:',
            this.complaints.length
          );

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error) => {

          console.error(
            '================================='
          );

          console.error(
            'CITYFIX DASHBOARD API ERROR'
          );

          console.error(
            'Status:',
            error.status
          );

          console.error(
            'Message:',
            error.message
          );

          console.error(
            'Full error:',
            error
          );

          console.error(
            '================================='
          );


          // -------------------------------------------
          // RESET DATA
          // -------------------------------------------

          this.complaints = [];

          this.recentComplaints = [];

          this.categories = [];


          // -------------------------------------------
          // ERROR MESSAGE
          // -------------------------------------------

          if (error.status === 401) {

            this.errorMessage =
              'Your admin session has expired. Please log in again.';

          }

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to access the admin dashboard.';

          }

          else {

            this.errorMessage =
              'Unable to load dashboard data. Please make sure the backend is running.';

          }


          // -------------------------------------------
          // STOP LOADING
          // -------------------------------------------

          this.isLoading = false;


          // -------------------------------------------
          // UPDATE UI
          // -------------------------------------------

          this.cdr.detectChanges();

        }

      });

  }


  // ===================================================
  // PREPARE DASHBOARD DATA
  // ===================================================

  prepareDashboardData(): void {


    // =================================================
    // RECENT COMPLAINTS
    // =================================================

    this.recentComplaints = [

      ...this.complaints

    ]

      .sort(

        (
          a: Complaint,
          b: Complaint
        ) => {

          const dateA =
            a.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;


          const dateB =
            b.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;


          return dateB - dateA;

        }

      )

      .slice(0, 5);


    // =================================================
    // CATEGORY COUNTS
    // =================================================

    const categoryMap =
      new Map<string, number>();


    this.complaints.forEach(

      (complaint: Complaint) => {

        const category =
          complaint.category ||
          'Other';


        categoryMap.set(

          category,

          (
            categoryMap.get(category) ||
            0
          ) + 1

        );

      }

    );


    // =================================================
    // CONVERT CATEGORY MAP
    // =================================================

    this.categories =

      Array
        .from(
          categoryMap.entries()
        )

        .map(

          (
            [name, count]
          ) => ({

            name,

            count

          })

        )

        .sort(

          (
            a,
            b
          ) =>
            b.count - a.count

        )

        .slice(0, 5);

  }


  // ===================================================
  // TOTAL COMPLAINTS
  // ===================================================

  get totalComplaints(): number {

    return this.complaints.length;

  }


  // ===================================================
  // PRIORITY COUNT
  // ===================================================

  getCount(
    priority: string
  ): number {

    return this.complaints.filter(

      (complaint: Complaint) =>

        this.getPriorityLevel(
          complaint
        ) === priority

    ).length;

  }


  // ===================================================
  // STATUS COUNT
  // ===================================================

  getStatusCount(
    status: string
  ): number {

    return this.complaints.filter(

      (complaint: Complaint) =>

        (
          complaint.status ||
          'Pending'
        ) === status

    ).length;

  }


  // ===================================================
  // PRIORITY LEVEL
  // ===================================================

  getPriorityLevel(
    complaint: Complaint
  ): string {


    // -----------------------------------------------
    // USE SAVED PRIORITY
    // -----------------------------------------------

    if (
      complaint.priorityLevel
    ) {

      return complaint.priorityLevel;

    }


    // -----------------------------------------------
    // CALCULATE FROM SCORE
    // -----------------------------------------------

    const score =
      complaint.priorityScore ?? 0;


    if (score >= 80) {

      return 'Critical';

    }


    if (score >= 60) {

      return 'High';

    }


    if (score >= 40) {

      return 'Medium';

    }


    return 'Low';

  }


  // ===================================================
  // PRIORITY CLASS
  // ===================================================

  getPriorityClass(
    complaint: Complaint
  ): string {

    return this
      .getPriorityLevel(
        complaint
      )
      .toLowerCase();

  }


  // ===================================================
  // PRIORITY PERCENTAGE
  // ===================================================

  getPriorityPercentage(
    priority: string
  ): number {


    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        this.getCount(priority) /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // STATUS PERCENTAGE
  // ===================================================

  getStatusPercentage(
    status: string
  ): number {


    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        this.getStatusCount(status) /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // CATEGORY PERCENTAGE
  // ===================================================

  getCategoryPercentage(
    count: number
  ): number {


    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        count /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // STATUS CLASS
  // ===================================================

  getStatusClass(
    status?: string
  ): string {

    return (

      status ||
      'Pending'

    )

      .toLowerCase()

      .replace(
        /\s+/g,
        '-'
      );

  }


  // ===================================================
  // FORMAT DATE
  // ===================================================

  formatDate(
    date?: string
  ): string {


    if (!date) {

      return 'N/A';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return 'N/A';

    }


    return parsedDate.toLocaleDateString(

      'en-IN',

      {

        day: '2-digit',

        month: 'short',

        year: 'numeric'

      }

    );

  }


  // ===================================================
  // REFRESH DASHBOARD
  // ===================================================

  refreshDashboard(): void {

    this.loadDashboard();

  }


  // ===================================================
  // ADMIN LOGOUT
  // ===================================================

  logout(): void {

    console.log(
      'Logging out admin...'
    );


    // -------------------------------------------------
    // REMOVE JWT TOKEN
    // -------------------------------------------------

    localStorage.removeItem(
      'cityfixAdminToken'
    );


    // -------------------------------------------------
    // REMOVE OLD ADMIN SESSION FLAG
    // -------------------------------------------------

    localStorage.removeItem(
      'cityfixAdmin'
    );


    // -------------------------------------------------
    // REMOVE ADMIN EMAIL
    // -------------------------------------------------

    localStorage.removeItem(
      'cityfixAdminEmail'
    );


    // -------------------------------------------------
    // RETURN TO ADMIN LOGIN
    // -------------------------------------------------

    this.router.navigate([
      '/admin-login'
    ]);

  }

}