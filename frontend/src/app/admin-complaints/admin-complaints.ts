import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


// =====================================================
// LOCATION INTERFACE
// =====================================================

interface ComplaintLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}


// =====================================================
// COMPLAINT INTERFACE
// =====================================================

interface Complaint {
  _id?: string;

  title?: string;

  description?: string;

  // PHOTO
  photo?: string;

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
  selector: 'app-admin-complaints',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-complaints.html',

  styleUrl: './admin-complaints.css'
})


export class AdminComplaintsComponent
  implements OnInit {


  // ===================================================
  // DATA
  // ===================================================

  complaints: Complaint[] = [];

  selectedComplaint: Complaint | null = null;


  // ===================================================
  // LOADING
  // ===================================================

  isLoading = true;

  isReanalyzing = false;

  errorMessage = '';


  // ===================================================
  // FILTERS
  // ===================================================

  searchText = '';

  selectedPriority = 'All';

  selectedCategory = 'All';

  selectedStatus = 'All';


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
    private cdr: ChangeDetectorRef
  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.loadComplaints();

  }


  // ===================================================
  // LOAD COMPLAINTS
  // ===================================================

  loadComplaints(): void {

    this.isLoading = true;

    this.errorMessage = '';

    console.log(
      'Loading complaints...'
    );

    console.log(
      'API:',
      this.apiUrl
    );


    this.http
      .get<Complaint[]>(this.apiUrl)

      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (
          data: Complaint[]
        ) => {

          console.log(
            'Complaints received:',
            data
          );

          console.log(
            'Number of complaints:',
            data.length
          );


          if (Array.isArray(data)) {

            this.complaints = data;

          } else {

            this.complaints = [];

            console.error(
              'Unexpected API response:',
              data
            );

          }


          // STOP LOADING

          this.isLoading = false;


          // FORCE UI UPDATE

          this.cdr.detectChanges();


          console.log(
            'Loading finished:',
            this.isLoading
          );

        },


        // =============================================
        // ERROR
        // =============================================

        error: (
          error
        ) => {

          console.error(
            'Complaint API Error:',
            error
          );


          this.complaints = [];


          this.errorMessage =
            'Unable to load complaints. Please make sure the backend is running.';


          this.isLoading = false;


          this.cdr.detectChanges();

        }

      });

  }


  // ===================================================
  // REFRESH
  // ===================================================

  refreshComplaints(): void {

    this.loadComplaints();

  }


  // ===================================================
  // FILTERED COMPLAINTS
  // ===================================================

  get filteredComplaints(): Complaint[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    return this.complaints.filter(
      (
        complaint: Complaint
      ) => {


        // =============================================
        // SEARCH
        // =============================================

        const title =
          complaint.title || '';


        const description =
          complaint.description || '';


        const address =
          complaint.location?.address || '';


        const matchesSearch =
          !search ||

          title
            .toLowerCase()
            .includes(search) ||

          description
            .toLowerCase()
            .includes(search) ||

          address
            .toLowerCase()
            .includes(search);


        // =============================================
        // PRIORITY
        // =============================================

        const priority =
          this.getPriorityLevel(
            complaint
          );


        const matchesPriority =
          this.selectedPriority === 'All' ||

          priority ===
          this.selectedPriority;


        // =============================================
        // CATEGORY
        // =============================================

        const category =
          complaint.category ||
          'Other';


        const matchesCategory =
          this.selectedCategory === 'All' ||

          category ===
          this.selectedCategory;


        // =============================================
        // STATUS
        // =============================================

        const status =
          complaint.status ||
          'Pending';


        const matchesStatus =
          this.selectedStatus === 'All' ||

          status ===
          this.selectedStatus;


        return (
          matchesSearch &&
          matchesPriority &&
          matchesCategory &&
          matchesStatus
        );

      }
    );

  }


  // ===================================================
  // FILTER CHANGE
  // ===================================================

  onFilterChange(): void {

    // filteredComplaints is automatically
    // recalculated because it is a getter.

  }


  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedPriority = 'All';

    this.selectedCategory = 'All';

    this.selectedStatus = 'All';

  }


  // ===================================================
  // GET PRIORITY LEVEL
  // ===================================================

  getPriorityLevel(
    complaint: Complaint
  ): string {


    // Use AI/database priority first

    if (
      complaint.priorityLevel
    ) {

      return complaint.priorityLevel;

    }


    // Otherwise calculate from priority score

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
  // PRIORITY CSS CLASS
  // ===================================================

  getPriorityClass(
    level: string
  ): string {

    if (!level) {

      return 'low';

    }


    return level
      .toLowerCase()
      .replace(/\s+/g, '-');

  }


  // ===================================================
  // PRIORITY COUNT
  // ===================================================

  getCount(
    priority: string
  ): number {

    return this.complaints.filter(
      (
        complaint: Complaint
      ) => {

        return (
          this.getPriorityLevel(
            complaint
          ) === priority
        );

      }
    ).length;

  }


  // ===================================================
  // STATUS COUNT
  // ===================================================

  getStatusCount(
    status: string
  ): number {

    return this.complaints.filter(
      (
        complaint: Complaint
      ) => {

        return (
          (
            complaint.status ||
            'Pending'
          ) === status
        );

      }
    ).length;

  }


  // ===================================================
  // AI LEVEL CLASS
  // ===================================================

  getAILevelClass(
    level?: string
  ): string {

    if (!level) {

      return 'low';

    }


    const normalized =
      level.toLowerCase();


    if (
      normalized.includes('critical')
    ) {

      return 'critical';

    }


    if (
      normalized.includes('high')
    ) {

      return 'high';

    }


    if (
      normalized.includes('medium')
    ) {

      return 'medium';

    }


    return 'low';

  }


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  updateStatus(
    id: string | undefined,
    event: Event
  ): void {


    if (!id) {

      return;

    }


    const select =
      event.target as HTMLSelectElement;


    const status =
      select.value;


    console.log(
      'Updating status:',
      id,
      status
    );


    this.http
      .put<{
        message: string;
        complaint: Complaint;
      }>(
        `${this.apiUrl}/${id}/status`,
        {
          status: status
        }
      )

      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (
          response
        ) => {

          console.log(
            'Status updated:',
            response
          );


          // Update main complaints array

          const complaint =
            this.complaints.find(
              (
                item: Complaint
              ) =>
                item._id === id
            );


          if (complaint) {

            complaint.status =
              status;

          }


          // Update selected complaint

          if (
            this.selectedComplaint &&
            this.selectedComplaint._id === id
          ) {

            this.selectedComplaint = {

              ...this.selectedComplaint,

              status: status

            };

          }


          this.cdr.detectChanges();

        },


        // =============================================
        // ERROR
        // =============================================

        error: (
          error
        ) => {

          console.error(
            'Status update error:',
            error
          );


          alert(
            'Unable to update complaint status.'
          );

        }

      });

  }


  // ===================================================
  // VIEW COMPLAINT
  // ===================================================

  viewComplaint(
    complaint: Complaint
  ): void {

    this.selectedComplaint =
      complaint;

  }


  // ===================================================
  // CLOSE COMPLAINT
  // ===================================================

  closeComplaintDetails(): void {

    this.selectedComplaint =
      null;

  }


  // ===================================================
  // RE-ANALYZE ALL COMPLAINTS
  // ===================================================

  reanalyzeAllComplaints(): void {


    if (
      this.isReanalyzing
    ) {

      return;

    }


    this.isReanalyzing =
      true;


    console.log(
      'Starting complaint re-analysis...'
    );


    this.http
      .put<{
        message: string;
        updatedCount: number;
      }>(
        `${this.apiUrl}/reanalyze`,
        {}
      )

      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (
          response
        ) => {

          console.log(
            'Re-analysis complete:',
            response
          );


          this.isReanalyzing =
            false;


          this.loadComplaints();

        },


        // =============================================
        // ERROR
        // =============================================

        error: (
          error
        ) => {

          console.error(
            'Re-analysis error:',
            error
          );


          this.isReanalyzing =
            false;


          alert(
            'Unable to re-analyze complaints.'
          );


          this.cdr.detectChanges();

        }

      });

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
  // TRACK COMPLAINT
  // ===================================================

  trackByComplaint(
    index: number,
    complaint: Complaint
  ): string | number {

    return (
      complaint._id ||
      index
    );

  }

}