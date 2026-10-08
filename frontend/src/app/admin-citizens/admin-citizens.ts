import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


// =====================================================
// CITIZEN INFORMATION
// =====================================================

interface ComplaintCitizen {

  name?: string;

  email?: string;

  phone?: string;

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

  status?: string;

  citizen?: ComplaintCitizen;

  location?: {

    address?: string;

    latitude?: number;

    longitude?: number;

  };

  createdAt?: string;

  updatedAt?: string;

}


// =====================================================
// CITIZEN
// =====================================================

interface Citizen {

  id: string;

  name: string;

  email: string;

  phone: string;

  complaints: Complaint[];

  complaintCount: number;

  latestComplaint: string;

  latestDate?: string;

  status: string;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-admin-citizens',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-citizens.html',

  styleUrl: './admin-citizens.css'

})


export class AdminCitizensComponent
  implements OnInit {


  // ===================================================
  // DATA
  // ===================================================

  complaints: Complaint[] = [];

  citizens: Citizen[] = [];

  filteredCitizens: Citizen[] = [];

  selectedCitizen: Citizen | null = null;


  // ===================================================
  // SEARCH
  // ===================================================

  searchText = '';


  // ===================================================
  // FILTER
  // ===================================================

  selectedStatus = 'All';


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

    private cdr: ChangeDetectorRef

  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.loadCitizens();

  }


  // ===================================================
  // LOAD CITIZENS
  // ===================================================

  loadCitizens(): void {

    this.isLoading = true;

    this.errorMessage = '';


    console.log(
      '================================='
    );

    console.log(
      'CITYFIX CITIZENS'
    );

    console.log(
      'Loading citizen information...'
    );

    console.log(
      'API:',
      this.apiUrl
    );

    console.log(
      '================================='
    );


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
            'Citizens API response:',
            data
          );


          if (
            Array.isArray(data)
          ) {

            this.complaints =
              data;

            this.prepareCitizens();

          }

          else {

            this.complaints =
              [];

            this.citizens =
              [];

            this.filteredCitizens =
              [];

          }


          this.isLoading =
            false;


          this.cdr.detectChanges();

        },


        // =============================================
        // ERROR
        // =============================================

        error: (
          error
        ) => {

          console.error(
            'Citizens API Error:',
            error
          );


          this.complaints =
            [];

          this.citizens =
            [];

          this.filteredCitizens =
            [];


          this.errorMessage =
            'Unable to load citizen information. Please make sure the backend is running.';


          this.isLoading =
            false;


          this.cdr.detectChanges();

        }

      });

  }


  // ===================================================
  // PREPARE CITIZENS
  // ===================================================

  prepareCitizens(): void {

    const citizenMap =
      new Map<
        string,
        Complaint[]
      >();


    // ================================================
    // GROUP COMPLAINTS BY CITIZEN
    // ================================================

    this.complaints.forEach(

      (
        complaint: Complaint
      ) => {

        const name =
          this.getCitizenName(
            complaint
          );


        const email =
          this.getCitizenEmail(
            complaint
          );


        const phone =
          this.getCitizenPhone(
            complaint
          );


        /*
         * Use email as the main identifier.
         * If email is unavailable, use phone.
         * If both are unavailable, use name.
         */

        const key =
          email ||
          phone ||
          name;


        if (
          !citizenMap.has(key)
        ) {

          citizenMap.set(
            key,
            []
          );

        }


        citizenMap
          .get(key)!
          .push(complaint);

      }

    );


    // ================================================
    // CREATE CITIZEN OBJECTS
    // ================================================

    this.citizens =

      Array.from(
        citizenMap.entries()
      )

      .map(

        (
          [key, complaints]
        ): Citizen => {


          // ==========================================
          // SORT COMPLAINTS
          // ==========================================

          const sortedComplaints =

            [
              ...complaints
            ]

            .sort(

              (
                a,
                b
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


                return (
                  dateB -
                  dateA
                );

              }

            );


          // ==========================================
          // LATEST COMPLAINT
          // ==========================================

          const latest =
            sortedComplaints[0];


          // ==========================================
          // RETURN CITIZEN
          // ==========================================

          return {

            id:
              key,

            name:
              this.getCitizenName(
                latest
              ),

            email:
              this.getCitizenEmail(
                latest
              ),

            phone:
              this.getCitizenPhone(
                latest
              ),

            complaints:
              sortedComplaints,

            complaintCount:
              complaints.length,

            latestComplaint:
              latest?.title ||
              'No complaint',

            latestDate:
              latest?.createdAt,

            status:
              this.getCitizenStatus(
                complaints
              )

          };

        }

      );


    // ================================================
    // SORT CITIZENS
    // ================================================

    this.citizens.sort(

      (
        a,
        b
      ) =>

        b.complaintCount -
        a.complaintCount

    );


    // ================================================
    // APPLY SEARCH/FILTER
    // ================================================

    this.applyFilters();

  }


  // ===================================================
  // GET CITIZEN NAME
  // ===================================================

  getCitizenName(
    complaint?: Complaint
  ): string {

    return (

      complaint?.citizen?.name ||

      'Unknown Citizen'

    );

  }


  // ===================================================
  // GET CITIZEN EMAIL
  // ===================================================

  getCitizenEmail(
    complaint?: Complaint
  ): string {

    return (

      complaint?.citizen?.email ||

      'No email available'

    );

  }


  // ===================================================
  // GET CITIZEN PHONE
  // ===================================================

  getCitizenPhone(
    complaint?: Complaint
  ): string {

    return (

      complaint?.citizen?.phone ||

      'No phone available'

    );

  }


  // ===================================================
  // GET CITIZEN STATUS
  // ===================================================

  getCitizenStatus(
    complaints: Complaint[]
  ): string {

    if (
      !complaints.length
    ) {

      return 'Active';

    }


    const hasPending =

      complaints.some(

        complaint =>

          (
            complaint.status ||
            'Pending'
          ).toLowerCase() ===
          'pending'

      );


    if (
      hasPending
    ) {

      return 'Active';

    }


    const allResolved =

      complaints.every(

        complaint =>

          (
            complaint.status ||
            ''
          ).toLowerCase() ===
          'resolved'

      );


    if (
      allResolved
    ) {

      return 'Resolved';

    }


    return 'Active';

  }


  // ===================================================
  // GET INITIAL
  // ===================================================

  getInitial(
    name?: string
  ): string {

    if (
      !name ||
      !name.trim()
    ) {

      return '?';

    }


    return name
      .trim()
      .charAt(0)
      .toUpperCase();

  }


  // ===================================================
  // SEARCH
  // ===================================================

  onSearchChange(): void {

    this.applyFilters();

  }


  // ===================================================
  // APPLY FILTERS
  // ===================================================

  applyFilters(): void {

    const search =

      this.searchText
        .trim()
        .toLowerCase();


    this.filteredCitizens =

      this.citizens.filter(

        (
          citizen: Citizen
        ) => {


          // ==========================================
          // SEARCH
          // ==========================================

          const matchesSearch =

            !search ||

            citizen.name
              .toLowerCase()
              .includes(search) ||

            citizen.email
              .toLowerCase()
              .includes(search) ||

            citizen.phone
              .toLowerCase()
              .includes(search) ||

            citizen.latestComplaint
              .toLowerCase()
              .includes(search);


          // ==========================================
          // STATUS
          // ==========================================

          const matchesStatus =

            this.selectedStatus ===
              'All' ||

            citizen.status ===
              this.selectedStatus;


          return (

            matchesSearch &&

            matchesStatus

          );

        }

      );

  }


  // ===================================================
  // STATUS FILTER
  // ===================================================

  onStatusChange(): void {

    this.applyFilters();

  }


  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  clearFilters(): void {

    this.searchText =
      '';

    this.selectedStatus =
      'All';

    this.applyFilters();

  }


  // ===================================================
  // VIEW CITIZEN
  // ===================================================

  viewCitizen(
    citizen: Citizen
  ): void {

    this.selectedCitizen =
      citizen;

  }


  // ===================================================
  // CLOSE CITIZEN
  // ===================================================

  closeCitizen(): void {

    this.selectedCitizen =
      null;

  }


  // ===================================================
  // TOTAL CITIZENS
  // ===================================================

  get totalCitizens(): number {

    return this.citizens.length;

  }


  // ===================================================
  // ACTIVE CITIZENS
  // ===================================================

  get activeCitizens(): number {

    return this.citizens.filter(

      citizen =>

        citizen.status ===
        'Active'

    ).length;

  }


  // ===================================================
  // RESOLVED CITIZENS
  // ===================================================

  get resolvedCitizens(): number {

    return this.citizens.filter(

      citizen =>

        citizen.status ===
        'Resolved'

    ).length;

  }


  // ===================================================
  // TOTAL COMPLAINTS
  // ===================================================

  get totalComplaints(): number {

    return this.complaints.length;

  }


  // ===================================================
  // CITIZEN COMPLAINT COUNT
  // ===================================================

  getCitizenComplaintCount(
    citizen: Citizen
  ): number {

    return citizen.complaintCount;

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


    if (
      score >= 80
    ) {

      return 'Critical';

    }


    if (
      score >= 60
    ) {

      return 'High';

    }


    if (
      score >= 40
    ) {

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
  // STATUS CLASS
  // ===================================================

  getStatusClass(
    status?: string
  ): string {

    return (

      status ||
      'Active'

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


    return parsedDate

      .toLocaleDateString(

        'en-IN',

        {

          day:
            '2-digit',

          month:
            'short',

          year:
            'numeric'

        }

      );

  }


  // ===================================================
  // REFRESH
  // ===================================================

  refreshCitizens(): void {

    this.loadCitizens();

  }
  // ===================================================
  // MOST ACTIVE CITIZEN
  // ===================================================

  get mostActiveCitizen(): Citizen | null {

    if (!this.citizens.length) {
      return null;
    }

    return this.citizens.reduce(
      (mostActive, citizen) => {

        if (
          citizen.complaintCount >
          mostActive.complaintCount
        ) {
          return citizen;
        }

        return mostActive;

      }
    );

  }


  // ===================================================
  // TRACK CITIZEN
  // ===================================================

  trackByCitizen(
    index: number,
    citizen: Citizen
  ): string {

    return citizen.id || index.toString();

  }

}