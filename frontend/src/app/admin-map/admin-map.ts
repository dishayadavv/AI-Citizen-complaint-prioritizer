import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import * as L from 'leaflet';


// =====================================================
// COMPLAINT INTERFACE
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

  status?: string;

  location?: {

    address?: string;

    latitude?: number;

    longitude?: number;

  };

  createdAt?: string;

  updatedAt?: string;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-admin-map',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-map.html',

  styleUrl: './admin-map.css'

})


export class AdminMap
  implements OnInit, AfterViewInit, OnDestroy {


  // ===================================================
  // DATA
  // ===================================================

  complaints: Complaint[] = [];

  filteredComplaints: Complaint[] = [];

  selectedComplaint: Complaint | null = null;


  // ===================================================
  // SEARCH
  // ===================================================

  searchText = '';


  // ===================================================
  // FILTER
  // ===================================================

  selectedPriority = 'All';


  // ===================================================
  // LOADING
  // ===================================================

  isLoading = true;

  errorMessage = '';


  // ===================================================
  // MAP
  // ===================================================

  private map: L.Map | null = null;

  private markers: L.Marker[] = [];


  // ===================================================
  // API
  // ===================================================

  private apiUrl =
    'http://localhost:5000/api/complaints';


  // ===================================================
  // MUMBAI DEFAULT LOCATION
  // ===================================================

  private readonly defaultMapCenter:
    L.LatLngExpression = [
      19.0760,
      72.8777
    ];


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
  // AFTER VIEW INIT
  // ===================================================

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.initializeMap();

    }, 100);

  }


  // ===================================================
  // INITIALIZE MAP
  // ===================================================

  private initializeMap(): void {

    if (this.map) {

      return;

    }


    const mapElement =
      document.getElementById(
        'adminMap'
      );


    if (!mapElement) {

      console.error(
        'Map element not found'
      );

      return;

    }


    this.map = L.map(
      mapElement,
      {
        center:
          this.defaultMapCenter,

        zoom: 11,

        zoomControl: true
      }
    );


    L.tileLayer(

      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

      {

        attribution:
          '&copy; OpenStreetMap contributors',

        maxZoom: 19

      }

    ).addTo(this.map);


    setTimeout(() => {

      this.map?.invalidateSize();

      this.updateMapMarkers();

    }, 200);

  }


  // ===================================================
  // LOAD COMPLAINTS
  // ===================================================

  loadComplaints(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.http
      .get<Complaint[]>(
        this.apiUrl
      )
      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (
          data: Complaint[]
        ) => {

          console.log(
            'MAP COMPLAINTS:',
            data
          );


          if (
            Array.isArray(data)
          ) {

            this.complaints =
              data;

          } else {

            this.complaints =
              [];

          }


          this.applyFilters();


          this.isLoading =
            false;


          this.cdr.detectChanges();


          setTimeout(() => {

            this.updateMapMarkers();

          }, 100);

        },


        // =============================================
        // ERROR
        // =============================================

        error: (
          error
        ) => {

          console.error(
            'MAP API ERROR:',
            error
          );


          this.complaints =
            [];

          this.filteredComplaints =
            [];


          this.errorMessage =
            'Unable to load complaint locations. Please make sure the backend is running.';


          this.isLoading =
            false;


          this.cdr.detectChanges();

        }

      });

  }


  // ===================================================
  // APPLY FILTERS
  // ===================================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredComplaints =
      this.complaints.filter(

        complaint => {

          const title =
            (
              complaint.title ||
              ''
            ).toLowerCase();


          const category =
            (
              complaint.category ||
              ''
            ).toLowerCase();


          const address =
            (
              complaint.location?.address ||
              ''
            ).toLowerCase();


          const matchesSearch =

            !search ||

            title.includes(search) ||

            category.includes(search) ||

            address.includes(search);


          const matchesPriority =

            this.selectedPriority ===
            'All' ||

            this.getPriorityLevel(
              complaint
            ) ===
            this.selectedPriority;


          return (
            matchesSearch &&
            matchesPriority
          );

        }

      );


    this.updateMapMarkers();

  }


  // ===================================================
  // SEARCH CHANGE
  // ===================================================

  onSearchChange(): void {

    this.applyFilters();

  }


  // ===================================================
  // PRIORITY CHANGE
  // ===================================================

  onPriorityChange(): void {

    this.applyFilters();

  }


  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedPriority =
      'All';

    this.applyFilters();

  }


  // ===================================================
  // UPDATE MAP MARKERS
  // ===================================================

  private updateMapMarkers(): void {

    if (!this.map) {

      return;

    }


    // -----------------------------------------------
    // REMOVE OLD MARKERS
    // -----------------------------------------------

    this.markers.forEach(
      marker => {

        marker.removeFrom(
          this.map!
        );

      }
    );


    this.markers = [];


    // -----------------------------------------------
    // ADD NEW MARKERS
    // -----------------------------------------------

    const validCoordinates:
      L.LatLngExpression[] = [];


    this.filteredComplaints
      .forEach(

        (
          complaint
        ) => {

          const coordinates =
            this.getComplaintCoordinates(
              complaint
            );


          if (!coordinates) {

            return;

          }


          const marker =
            this.createMarker(
              complaint,
              coordinates
            );


          marker.addTo(
            this.map!
          );


          this.markers.push(
            marker
          );


          validCoordinates.push(
            coordinates
          );

        }

      );


    // -----------------------------------------------
    // FIT MAP TO MARKERS
    // -----------------------------------------------

    if (
      validCoordinates.length > 0
    ) {

      const bounds =
        L.latLngBounds(
          validCoordinates
        );


      this.map.fitBounds(
        bounds,
        {
          padding: [
            40,
            40
          ],

          maxZoom: 13
        }
      );

    } else {

      this.map.setView(
        this.defaultMapCenter,
        11
      );

    }


    setTimeout(() => {

      this.map?.invalidateSize();

    }, 100);

  }


  // ===================================================
  // GET COMPLAINT COORDINATES
  // ===================================================

  private getComplaintCoordinates(
    complaint: Complaint
  ): L.LatLngExpression | null {

    const latitude =
      complaint.location?.latitude;


    const longitude =
      complaint.location?.longitude;


    // -----------------------------------------------
    // USE REAL COORDINATES
    // -----------------------------------------------

    if (

      typeof latitude ===
      'number' &&

      typeof longitude ===
      'number' &&

      Number.isFinite(latitude) &&

      Number.isFinite(longitude)

    ) {

      return [
        latitude,
        longitude
      ];

    }


    // -----------------------------------------------
    // FALLBACK FOR CURRENT DATA
    // -----------------------------------------------

    const address =
      (
        complaint.location?.address ||
        ''
      ).toLowerCase();


    const fallback =
      this.getMumbaiLocation(
        address
      );


    return fallback;

  }


  // ===================================================
  // MUMBAI LOCATION FALLBACK
  // ===================================================

  private getMumbaiLocation(
    address: string
  ): L.LatLngExpression {

    if (
      address.includes('powai')
    ) {

      return [
        19.1176,
        72.9060
      ];

    }


    if (
      address.includes('kurla')
    ) {

      return [
        19.0726,
        72.8845
      ];

    }


    if (
      address.includes('bandra')
    ) {

      return [
        19.0607,
        72.8362
      ];

    }


    if (
      address.includes('bhandup')
    ) {

      return [
        19.1466,
        72.9377
      ];

    }


    if (
      address.includes('ghatkopar')
    ) {

      return [
        19.0860,
        72.9081
      ];

    }


    if (
      address.includes('kanjurmarg')
    ) {

      return [
        19.1314,
        72.9357
      ];

    }


    if (
      address.includes('andheri')
    ) {

      return [
        19.1197,
        72.8468
      ];

    }


    return [
      19.0760,
      72.8777
    ];

  }


  // ===================================================
  // CREATE MARKER
  // ===================================================

  private createMarker(

    complaint: Complaint,

    coordinates:
      L.LatLngExpression

  ): L.Marker {


    const priority =
      this.getPriorityLevel(
        complaint
      );


    const color =
      this.getPriorityColor(
        priority
      );


    const icon =
      L.divIcon({

        className:
          'custom-map-marker',

        html: `
          <div
            style="
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              background: ${color};
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            "
          >
            <span
              style="
                display: block;
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                margin: 8px auto;
              "
            ></span>
          </div>
        `,

        iconSize: [
          30,
          30
        ],

        iconAnchor: [
          15,
          30
        ],

        popupAnchor: [
          0,
          -30
        ]

      });


    const marker =
      L.marker(
        coordinates,
        {
          icon
        }
      );


    marker.bindPopup(

      this.createPopupContent(
        complaint
      )

    );


    marker.on(
      'click',
      () => {

        this.selectedComplaint =
          complaint;


        this.cdr.detectChanges();

      }
    );


    return marker;

  }


  // ===================================================
  // POPUP
  // ===================================================

  private createPopupContent(
    complaint: Complaint
  ): string {

    const title =
      this.escapeHtml(
        complaint.title ||
        'Untitled Complaint'
      );


    const category =
      this.escapeHtml(
        complaint.category ||
        'Other'
      );


    const address =
      this.escapeHtml(
        complaint.location?.address ||
        'Location unavailable'
      );


    const priority =
      this.getPriorityLevel(
        complaint
      );


    const score =
      complaint.priorityScore ??
      0;


    return `

      <div
        style="
          min-width: 220px;
          font-family: Arial, sans-serif;
        "
      >

        <strong
          style="
            font-size: 15px;
            display: block;
            margin-bottom: 7px;
          "
        >
          ${title}
        </strong>


        <div
          style="
            font-size: 12px;
            margin-bottom: 5px;
          "
        >
          Category:
          <strong>
            ${category}
          </strong>
        </div>


        <div
          style="
            font-size: 12px;
            margin-bottom: 5px;
          "
        >
          Priority:
          <strong>
            ${priority}
          </strong>
        </div>


        <div
          style="
            font-size: 12px;
            margin-bottom: 5px;
          "
        >
          Score:
          <strong>
            ${score}/100
          </strong>
        </div>


        <div
          style="
            font-size: 12px;
            color: #666;
          "
        >
          📍 ${address}
        </div>

      </div>

    `;

  }


  // ===================================================
  // ESCAPE HTML
  // ===================================================

  private escapeHtml(
    value: string
  ): string {

    return value

      .replace(
        /&/g,
        '&amp;'
      )

      .replace(
        /</g,
        '&lt;'
      )

      .replace(
        />/g,
        '&gt;'
      )

      .replace(
        /"/g,
        '&quot;'
      )

      .replace(
        /'/g,
        '&#039;'
      );

  }


  // ===================================================
  // PRIORITY LEVEL
  // ===================================================

  getPriorityLevel(
    complaint: Complaint
  ): string {

    if (
      complaint.priorityLevel
    ) {

      return complaint.priorityLevel;

    }


    const score =
      complaint.priorityScore ??
      0;


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
  // PRIORITY COLOR
  // ===================================================

  getPriorityColor(
    level: string
  ): string {

    switch (
      level
    ) {

      case 'Critical':
        return '#dc2626';

      case 'High':
        return '#ea580c';

      case 'Medium':
        return '#d97706';

      default:
        return '#16a34a';

    }

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
  // TOTAL COMPLAINTS
  // ===================================================

  get totalComplaints(): number {

    return this.complaints.length;

  }


  // ===================================================
  // CRITICAL COMPLAINTS
  // ===================================================

  get criticalComplaints(): number {

    return this.complaints.filter(

      complaint =>
        this.getPriorityLevel(
          complaint
        ) === 'Critical'

    ).length;

  }


  // ===================================================
  // PENDING COMPLAINTS
  // ===================================================

  get pendingComplaints(): number {

    return this.complaints.filter(

      complaint =>
        (
          complaint.status ||
          'Pending'
        ) === 'Pending'

    ).length;

  }


  // ===================================================
  // RESOLVED COMPLAINTS
  // ===================================================

  get resolvedComplaints(): number {

    return this.complaints.filter(

      complaint =>
        complaint.status ===
        'Resolved'

    ).length;

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

  closeComplaint(): void {

    this.selectedComplaint =
      null;

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
  // REFRESH
  // ===================================================

  refreshMap(): void {

    this.loadComplaints();

  }


  // ===================================================
  // DESTROY
  // ===================================================

  ngOnDestroy(): void {

    if (this.map) {

      this.map.remove();

      this.map = null;

    }

  }

}