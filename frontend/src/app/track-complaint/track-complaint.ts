import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-track-complaint',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './track-complaint.html',
  styleUrl: './track-complaint.css'
})
export class TrackComplaint {

  complaintId = '';

  complaint: any = null;

  isLoading = false;

  errorMessage = '';

  private apiUrl =
    'http://localhost:5000/api/complaints';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================================
  // TRACK COMPLAINT
  // =========================================

  trackComplaint(): void {

    this.errorMessage = '';
    this.complaint = null;

    const id = this.complaintId.trim();

    if (!id) {

      this.errorMessage =
        'Please enter a complaint ID.';

      return;
    }

    this.isLoading = true;

    this.http
      .get<any>(
        `${this.apiUrl}/${encodeURIComponent(id)}`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'TRACK COMPLAINT RESPONSE:',
            response
          );

          this.complaint =
            response?.complaint ||
            response;

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Track complaint error:',
            error
          );

          this.isLoading = false;

          if (error?.status === 404) {

            this.errorMessage =
              'Complaint not found. Please check the complaint ID.';

          }
          else if (error?.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend. Please make sure the server is running.';

          }
          else {

            this.errorMessage =
              error?.error?.message ||
              'Unable to find this complaint.';

          }

          this.cdr.detectChanges();

        }

      });
  }


  // =========================================
  // STATUS CLASS
  // =========================================

  getStatusClass(): string {

    if (!this.complaint?.status) {
      return '';
    }

    return this.complaint.status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }


  // =========================================
  // CURRENT STATUS
  // =========================================

  getCurrentStatus(): string {

    return this.complaint?.status || 'Pending';

  }


  // =========================================
  // STATUS STEP
  // =========================================
  //
  // Pending       = 1
  // In Progress   = 2
  // Resolved      = 3
  //

  getStatusStep(): number {

    const status =
      this.complaint?.status;

    if (status === 'Resolved') {
      return 3;
    }

    if (status === 'In Progress') {
      return 2;
    }

    return 1;

  }


  // =========================================
  // CHECK COMPLETED STEP
  // =========================================

  isStepCompleted(
    step: number
  ): boolean {

    return step < this.getStatusStep();

  }


  // =========================================
  // CHECK CURRENT STEP
  // =========================================

  isCurrentStep(
    step: number
  ): boolean {

    return step === this.getStatusStep();

  }


  // =========================================
  // GET STEP CLASS
  // =========================================

  getStepClass(
    step: number
  ): string {

    if (this.isStepCompleted(step)) {
      return 'completed';
    }

    if (this.isCurrentStep(step)) {
      return 'current';
    }

    return 'upcoming';

  }


  // =========================================
  // STEP TITLE
  // =========================================

  getStepTitle(
    step: number
  ): string {

    switch (step) {

      case 1:
        return 'Complaint Submitted';

      case 2:
        return 'In Progress';

      case 3:
        return 'Resolved';

      default:
        return '';

    }

  }


  // =========================================
  // STEP DESCRIPTION
  // =========================================

  getStepDescription(
    step: number
  ): string {

    const currentStep =
      this.getStatusStep();

    if (step === 1) {

      return 'Your complaint has been received.';

    }

    if (step === 2) {

      if (currentStep >= 2) {
        return 'Authorities are working on the issue.';
      }

      return 'Waiting for authorities to begin work.';

    }

    if (step === 3) {

      if (currentStep >= 3) {
        return 'The reported issue has been resolved.';
      }

      return 'The issue will be marked resolved after completion.';

    }

    return '';

  }


  // =========================================
  // REFRESH / TRACK AGAIN
  // =========================================

  clearComplaint(): void {

    this.complaint = null;

    this.errorMessage = '';

    this.complaintId = '';

  }

}