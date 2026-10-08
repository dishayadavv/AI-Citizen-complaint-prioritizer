import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


// =====================================================
// INTERFACES
// =====================================================

interface CategoryData {
  _id: string;
  count: number;
}

interface AILevelData {
  _id: string;
  count: number;
}

interface AnalyticsResponse {

  totalComplaints: number;

  priority?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  status?: {
    pending: number;
    inProgress: number;
    resolved: number;
  };

  categories?: CategoryData[];

  aiLevels?: AILevelData[];
}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-admin-analytics',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './admin-analytics.html',

  styleUrl: './admin-analytics.css'

})
export class AdminAnalyticsComponent
  implements OnInit {


  // ===================================================
  // LOADING / ERROR
  // ===================================================

  isLoading = true;

  errorMessage = '';


  // ===================================================
  // TOTAL
  // ===================================================

  totalComplaints = 0;


  // ===================================================
  // PRIORITY
  // ===================================================

  priority = {

    critical: 0,

    high: 0,

    medium: 0,

    low: 0

  };


  // ===================================================
  // STATUS
  // ===================================================

  status = {

    pending: 0,

    inProgress: 0,

    resolved: 0

  };


  // ===================================================
  // CATEGORY
  // ===================================================

  categories: CategoryData[] = [];


  // ===================================================
  // AI LEVELS
  // ===================================================

  aiLevels: AILevelData[] = [];


  // ===================================================
  // API
  // ===================================================

  private apiUrl =
    'http://localhost:5000/api/complaints/analytics';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {}


  // ===================================================
  // INITIALIZATION
  // ===================================================

  ngOnInit(): void {

    this.loadAnalytics();

  }


  // ===================================================
  // LOAD ANALYTICS
  // ===================================================

  loadAnalytics(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.http
      .get<AnalyticsResponse>(
        this.apiUrl
      )
      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (data) => {

          console.log(
            'Analytics data:',
            data
          );


          // -------------------------------------------
          // TOTAL
          // -------------------------------------------

          this.totalComplaints =
            data.totalComplaints ?? 0;


          // -------------------------------------------
          // PRIORITY
          // -------------------------------------------

          this.priority = {

            critical:
              data.priority?.critical ?? 0,

            high:
              data.priority?.high ?? 0,

            medium:
              data.priority?.medium ?? 0,

            low:
              data.priority?.low ?? 0

          };


          // -------------------------------------------
          // STATUS
          // -------------------------------------------

          this.status = {

            pending:
              data.status?.pending ?? 0,

            inProgress:
              data.status?.inProgress ?? 0,

            resolved:
              data.status?.resolved ?? 0

          };


          // -------------------------------------------
          // CATEGORIES
          // -------------------------------------------

          this.categories =
            data.categories ?? [];


          // -------------------------------------------
          // AI LEVELS
          // -------------------------------------------

          this.aiLevels =
            data.aiLevels ?? [];


          // -------------------------------------------
          // STOP LOADING
          // -------------------------------------------

          this.isLoading = false;

          this.errorMessage = '';


          // -------------------------------------------
          // UPDATE VIEW
          // -------------------------------------------

          this.cdr.detectChanges();


          console.log(
            'Analytics loaded successfully'
          );

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error) => {

          console.error(
            'Analytics API Error:',
            error
          );


          this.isLoading = false;


          this.errorMessage =
            'Unable to load analytics. Please make sure the backend and MongoDB are running.';


          this.cdr.detectChanges();

        }

      });

  }


  // ===================================================
  // REFRESH
  // ===================================================

  refreshAnalytics(): void {

    this.loadAnalytics();

  }


  // ===================================================
  // PRIORITY PERCENTAGE
  // ===================================================

  getPriorityPercentage(
    value: number
  ): number {

    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        value /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // STATUS PERCENTAGE
  // ===================================================

  getStatusPercentage(
    value: number
  ): number {

    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        value /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // CATEGORY PERCENTAGE
  // ===================================================

  getCategoryPercentage(
    value: number
  ): number {

    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        value /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // AI PERCENTAGE
  // ===================================================

  getAILevelPercentage(
    value: number
  ): number {

    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        value /
        this.totalComplaints
      ) * 100

    );

  }


  // ===================================================
  // AI LEVEL CLASS
  // ===================================================

  getAILevelClass(
    level: string
  ): string {

    if (!level) {

      return 'low';

    }


    const normalized =
      level.toLowerCase();


    if (
      normalized.includes(
        'critical'
      )
    ) {

      return 'critical';

    }


    if (
      normalized.includes(
        'high'
      )
    ) {

      return 'high';

    }


    if (
      normalized.includes(
        'medium'
      )
    ) {

      return 'medium';

    }


    return 'low';

  }


  // ===================================================
  // DYNAMIC ANALYTICS INSIGHT
  // ===================================================

  getAnalyticsInsight(): string {

    // -----------------------------------------------
    // NO DATA
    // -----------------------------------------------

    if (
      this.totalComplaints === 0
    ) {

      return (
        'No complaint data is currently available for analysis.'
      );

    }


    // -----------------------------------------------
    // HIGH + CRITICAL
    // -----------------------------------------------

    const highPriority =
      this.priority.high +
      this.priority.critical;


    const highPriorityPercentage =
      Math.round(

        (
          highPriority /
          this.totalComplaints
        ) * 100

      );


    // -----------------------------------------------
    // PENDING
    // -----------------------------------------------

    const pendingPercentage =
      Math.round(

        (
          this.status.pending /
          this.totalComplaints
        ) * 100

      );


    // -----------------------------------------------
    // HIGH PRIORITY + HIGH PENDING
    // -----------------------------------------------

    if (

      highPriorityPercentage >= 70 &&

      pendingPercentage >= 70

    ) {

      return (

        `Most complaints are classified as High or Critical priority (${highPriorityPercentage}%), while ${pendingPercentage}% remain pending. This indicates that urgent citizen issues require immediate administrative attention.`

      );

    }


    // -----------------------------------------------
    // HIGH PRIORITY
    // -----------------------------------------------

    if (
      highPriorityPercentage >= 70
    ) {

      return (

        `${highPriorityPercentage}% of complaints are classified as High or Critical priority. Administrators should focus on resolving these urgent citizen issues first.`

      );

    }


    // -----------------------------------------------
    // HIGH PENDING
    // -----------------------------------------------

    if (
      pendingPercentage >= 70
    ) {

      return (

        `${pendingPercentage}% of complaints are currently pending. Improving resolution capacity could help reduce the number of unresolved citizen complaints.`

      );

    }


    // -----------------------------------------------
    // RESOLUTION RATE
    // -----------------------------------------------

    if (

      this.status.resolved > 0 &&

      this.status.resolved >=
      this.totalComplaints * 0.5

    ) {

      const resolvedPercentage =
        Math.round(

          (
            this.status.resolved /
            this.totalComplaints
          ) * 100

        );


      return (

        `${resolvedPercentage}% of complaints have been resolved, indicating strong progress in addressing citizen issues.`

      );

    }


    // -----------------------------------------------
    // DEFAULT
    // -----------------------------------------------

    return (

      `The dashboard is currently tracking ${this.totalComplaints} complaints across different priority levels, statuses, categories and AI-detected urgency levels.`

    );

  }

}