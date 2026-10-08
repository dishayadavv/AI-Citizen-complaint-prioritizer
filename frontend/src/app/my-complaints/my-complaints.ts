import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-complaints.html',
  styleUrl: './my-complaints.css'
})
export class MyComplaints {

  complaints: any[] = [];

  isLoading = true;
  errorMessage = '';

  selectedComplaint: any = null;
  showModal = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  // ==============================
  // LOAD COMPLAINTS
  // ==============================

  loadComplaints(): void {

    this.isLoading = true;
    this.errorMessage = '';

    const citizenEmail =
      localStorage.getItem('citizenEmail') ||
      this.getCitizenEmail();

    console.log('Citizen email:', citizenEmail);

    if (!citizenEmail) {

      this.isLoading = false;

      this.errorMessage =
        'Citizen information not found. Please login again.';

      return;
    }

    const url =
      `http://localhost:5000/api/complaints/citizen/${encodeURIComponent(citizenEmail)}`;

    console.log(
      'Fetching complaints from:',
      url
    );

    this.http.get<any>(url).subscribe({

      next: (response) => {

        console.log(
          'MY COMPLAINTS RESPONSE:',
          response
        );

        if (Array.isArray(response)) {

          this.complaints = response;

        }
        else if (
          response &&
          Array.isArray(response.complaints)
        ) {

          this.complaints =
            response.complaints;

        }
        else {

          this.complaints = [];

        }

        console.log(
          'Total citizen complaints:',
          this.complaints.length
        );

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'MY COMPLAINTS ERROR:',
          error
        );

        this.isLoading = false;

        if (error.status === 404) {

          this.errorMessage =
            'No complaints found.';

        }
        else if (error.status === 0) {

          this.errorMessage =
            'Unable to connect to the backend. Make sure the server is running.';

        }
        else {

          this.errorMessage =
            error.error?.message ||
            'Unable to load your complaints.';

        }

        this.cdr.detectChanges();

      }

    });
  }

  // ==============================
  // GET CITIZEN EMAIL
  // ==============================

  getCitizenEmail(): string {

    const citizenData =
      localStorage.getItem('cityfixCitizen') ||
      localStorage.getItem('citizen');

    if (!citizenData) {

      return '';

    }

    try {

      const citizen =
        JSON.parse(citizenData);

      return citizen.email || '';

    }
    catch (error) {

      console.error(
        'Error reading citizen data:',
        error
      );

      return '';

    }

  }

  // ==============================
  // STATISTICS
  // ==============================

  get totalComplaints(): number {

    return this.complaints.length;

  }

  get pendingComplaints(): number {

    return this.complaints.filter(
      complaint =>
        complaint.status === 'Pending'
    ).length;

  }

  get inProgressComplaints(): number {

    return this.complaints.filter(
      complaint =>
        complaint.status === 'In Progress'
    ).length;

  }

  get resolvedComplaints(): number {

    return this.complaints.filter(
      complaint =>
        complaint.status === 'Resolved'
    ).length;

  }

  // ==============================
  // GET STATUS
  // ==============================

  getStatus(complaint: any): string {

    if (!complaint) {

      return 'Pending';

    }

    return complaint.status || 'Pending';

  }

  // ==============================
  // STATUS CSS CLASS
  // ==============================

  getStatusClass(status: string): string {

    if (!status) {

      return 'pending';

    }

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');

  }

  // ==============================
  // VIEW COMPLAINT
  // ==============================

  viewComplaint(
    complaint: any
  ): void {

    this.selectedComplaint =
      complaint;

    this.showModal = true;

  }

  // ==============================
  // CLOSE COMPLAINT
  // ==============================

  closeComplaint(): void {

    this.showModal = false;

    this.selectedComplaint =
      null;

  }

  // Also kept in case HTML uses closeModal()
  closeModal(): void {

    this.showModal = false;

    this.selectedComplaint =
      null;

  }

  // ==============================
  // REFRESH
  // ==============================

  refreshComplaints(): void {

    this.loadComplaints();

  }

  // ==============================
  // FORMAT DATE
  // ==============================

  formatDate(
    date: string | Date | undefined
  ): string {

    if (!date) {

      return 'Not available';

    }

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {

      return 'Not available';

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

  // ==============================
  // PRIORITY LEVEL
  // ==============================

  getPriorityLevel(
    complaint: any
  ): string {

    if (!complaint) {

      return 'Low';

    }

    if (complaint.priorityLevel) {

      return complaint.priorityLevel;

    }

    const score =
      Number(
        complaint.priorityScore
      ) || 0;

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

  // ==============================
  // AI LEVEL
  // ==============================

  getAILevel(
    complaint: any
  ): string {

    if (!complaint) {

      return 'Low';

    }

    if (complaint.aiLevel) {

      return complaint.aiLevel;

    }

    const score =
      Number(
        complaint.aiScore
      ) || 0;

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

  // ==============================
  // PRIORITY CSS CLASS
  // ==============================

  getPriorityClass(
    complaint: any
  ): string {

    return this
      .getPriorityLevel(complaint)
      .toLowerCase();

  }

  // ==============================
  // AI CSS CLASS
  // ==============================

  getAIClass(
    complaint: any
  ): string {

    return this
      .getAILevel(complaint)
      .toLowerCase();

  }

}