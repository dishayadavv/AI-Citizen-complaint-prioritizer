import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Complaint {
  _id?: string;
  title?: string;
  category?: string;
  severity?: number;
  priorityScore?: number;
  priorityLevel?: string;
  aiScore?: number;
  aiLevel?: string;
  status?: string;

  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };

  createdAt?: string;
}

interface LocationData {
  address: string;
  latitude?: number;
  longitude?: number;
  complaintCount: number;
  criticalCount: number;
  highCount: number;
  pendingCount: number;
  resolvedCount: number;
  complaints: Complaint[];
}

@Component({
  selector: 'app-admin-locations',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './admin-locations.html',
  styleUrl: './admin-locations.css'
})
export class AdminLocations implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  complaints: Complaint[] = [];

  locations: LocationData[] = [];

  selectedLocation: LocationData | null = null;


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = true;

  errorMessage = '';


  // =====================================================
  // API
  // =====================================================

  private apiUrl =
    'http://localhost:5000/api/complaints';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadLocations();

  }


  // =====================================================
  // LOAD COMPLAINTS
  // =====================================================

  loadLocations(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.http
      .get<Complaint[]>(this.apiUrl)
      .subscribe({

        next: (data: Complaint[]) => {

          if (Array.isArray(data)) {

            this.complaints = data;

            this.prepareLocations();

          } else {

            this.complaints = [];

            this.locations = [];

          }

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Locations API Error:',
            error
          );

          this.complaints = [];

          this.locations = [];

          this.errorMessage =
            'Unable to load location data. Please make sure the backend is running.';

          this.isLoading = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // PREPARE LOCATIONS
  // =====================================================

  prepareLocations(): void {

    const locationMap =
      new Map<string, LocationData>();


    this.complaints.forEach(
      complaint => {

        const address =
          complaint.location?.address ||
          'Location unavailable';


        if (!locationMap.has(address)) {

          locationMap.set(
            address,
            {
              address: address,

              latitude:
                complaint.location?.latitude,

              longitude:
                complaint.location?.longitude,

              complaintCount: 0,

              criticalCount: 0,

              highCount: 0,

              pendingCount: 0,

              resolvedCount: 0,

              complaints: []
            }
          );

        }


        const location =
          locationMap.get(address)!;


        location.complaintCount++;


        location.complaints.push(
          complaint
        );


        const priority =
          this.getPriorityLevel(
            complaint
          );


        if (
          priority === 'Critical'
        ) {

          location.criticalCount++;

        }


        if (
          priority === 'High'
        ) {

          location.highCount++;

        }


        const status =
          complaint.status ||
          'Pending';


        if (
          status === 'Pending'
        ) {

          location.pendingCount++;

        }


        if (
          status === 'Resolved'
        ) {

          location.resolvedCount++;

        }

      }
    );


    this.locations =
      Array.from(
        locationMap.values()
      )
      .sort(
        (a, b) =>
          b.complaintCount -
          a.complaintCount
      );

  }


  // =====================================================
  // TOTAL LOCATIONS
  // =====================================================

  get totalLocations(): number {

    return this.locations.length;

  }


  // =====================================================
  // TOTAL COMPLAINTS
  // =====================================================

  get totalComplaints(): number {

    return this.complaints.length;

  }


  // =====================================================
  // MOST AFFECTED LOCATION
  // =====================================================

  get mostAffectedLocation(): string {

    if (!this.locations.length) {

      return 'N/A';

    }

    return this.locations[0].address;

  }


  // =====================================================
  // CRITICAL LOCATIONS
  // =====================================================

  get criticalLocations(): number {

    return this.locations.filter(
      location =>
        location.criticalCount > 0
    ).length;

  }


  // =====================================================
  // GET PRIORITY
  // =====================================================

  getPriorityLevel(
    complaint: Complaint
  ): string {

    if (
      complaint.priorityLevel
    ) {

      return complaint.priorityLevel;

    }


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


  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  getPriorityClass(
    complaint: Complaint
  ): string {

    return this
      .getPriorityLevel(complaint)
      .toLowerCase();

  }


  // =====================================================
  // VIEW LOCATION
  // =====================================================

  viewLocation(
    location: LocationData
  ): void {

    this.selectedLocation =
      location;

  }


  // =====================================================
  // CLOSE
  // =====================================================

  closeLocation(): void {

    this.selectedLocation =
      null;

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshLocations(): void {

    this.loadLocations();

  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByLocation(
    index: number,
    location: LocationData
  ): string {

    return location.address;

  }

}