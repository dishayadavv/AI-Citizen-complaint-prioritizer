import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';


// =====================================================
// COMPLAINT INTERFACE
// =====================================================

interface Complaint {

  _id?: string;

  title?: string;

  description?: string;

  category?: string;

  severity?: number;


  // ===================================================
  // PRIORITY
  // ===================================================

  priorityScore?: number;

  priorityLevel?: string;


  // ===================================================
  // AI ANALYSIS
  // ===================================================

  aiScore?: number;

  aiLevel?: string;

  aiReasons?: string[];

  detectedFactors?: string[];

  recommendedAction?: string;

  predictedResolutionTime?: number;


  // ===================================================
  // OTHER DATA
  // ===================================================

  similarComplaints?: number;

  status?: string;

  photo?: string;


  // ===================================================
  // LOCATION
  // ===================================================

  location?: {

    address?: string;

    latitude?: number;

    longitude?: number;

  };


  // ===================================================
  // DATES
  // ===================================================

  createdAt?: string;

  updatedAt?: string;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector:
    'app-admin-ai-analysis',

  standalone:
    true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './admin-ai-analysis.html',

  styleUrl:
    './admin-ai-analysis.css'

})


export class AdminAiAnalysis {


  // ===================================================
  // API
  // ===================================================

  private apiUrl =
    'http://localhost:5000/api/complaints';


  // ===================================================
  // DATA
  // ===================================================

  complaints:
    Complaint[] = [];

  selectedComplaint:
    Complaint | null = null;


  // ===================================================
  // UI STATE
  // ===================================================

  isLoading =
    true;

  isAnalyzing =
    false;

  errorMessage =
    '';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http:
      HttpClient,

    private cdr:
      ChangeDetectorRef

  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.loadAnalysis();

  }


  // ===================================================
  // LOAD AI ANALYSIS
  // ===================================================

  loadAnalysis(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    this.http
      .get<Complaint[]>(
        this.apiUrl
      )
      .subscribe({

        next:
          (response) => {

            console.log(
              'AI ANALYSIS RESPONSE:',
              response
            );


            if (
              Array.isArray(
                response
              )
            ) {

              this.complaints =
                response;

            }

            else {

              this.complaints =
                [];

            }


            console.log(
              'AI complaints loaded:',
              this.complaints.length
            );


            this.isLoading =
              false;

            this.cdr.detectChanges();

          },


        error:
          (error) => {

            console.error(
              'AI ANALYSIS ERROR:',
              error
            );


            this.isLoading =
              false;


            if (
              error.status === 401 ||
              error.status === 403
            ) {

              this.errorMessage =
                'Your admin session has expired. Please login again.';

            }

            else if (
              error.status === 0
            ) {

              this.errorMessage =
                'Unable to connect to the backend. Make sure the server is running.';

            }

            else {

              this.errorMessage =
                error.error?.message ||
                'Unable to load AI analysis.';

            }


            this.cdr.detectChanges();

          }

      });

  }


  // ===================================================
  // REFRESH
  // ===================================================

  refreshAnalysis(): void {

    this.loadAnalysis();

  }


  // ===================================================
  // RE-RUN AI ANALYSIS
  // ===================================================

  reanalyzeAll(): void {

    if (
      this.isAnalyzing
    ) {

      return;

    }


    this.isAnalyzing =
      true;

    this.errorMessage =
      '';


    console.log(
      'Starting AI re-analysis...'
    );


    this.http
      .post<any>(
        `${this.apiUrl}/reanalyze`,
        {}
      )
      .subscribe({

        next:
          (response) => {

            console.log(
              'AI RE-ANALYSIS RESPONSE:',
              response
            );


            this.isAnalyzing =
              false;


            // Reload the updated complaints
            this.loadAnalysis();

          },


        error:
          (error) => {

            console.error(
              'AI RE-ANALYSIS ERROR:',
              error
            );


            this.isAnalyzing =
              false;


            if (
              error.status === 401 ||
              error.status === 403
            ) {

              this.errorMessage =
                'Your admin session has expired. Please login again.';

            }

            else if (
              error.status === 0
            ) {

              this.errorMessage =
                'Unable to connect to the backend.';

            }

            else {

              this.errorMessage =
                error.error?.message ||
                'Unable to re-run AI analysis.';

            }


            this.cdr.detectChanges();

          }

      });

  }


  // ===================================================
  // TOTAL COMPLAINTS
  // ===================================================

  get totalComplaints(): number {

    return this.complaints.length;

  }


  // ===================================================
  // AVERAGE AI SCORE
  // ===================================================

  get averageAiScore(): number {

    if (
      this.complaints.length === 0
    ) {

      return 0;

    }


    const total =
      this.complaints.reduce(

        (
          sum,
          complaint
        ) => {

          return (
            sum +
            (
              Number(
                complaint.aiScore
              ) || 0
            )
          );

        },

        0

      );


    return Math.round(
      total /
      this.complaints.length
    );

  }


  // ===================================================
  // AI LEVEL
  // ===================================================

  getAILevel(
    complaint: Complaint
  ): string {

    if (!complaint) {

      return 'Low';

    }


    if (
      complaint.aiLevel
    ) {

      return complaint.aiLevel;

    }


    const score =
      Number(
        complaint.aiScore
      ) || 0;


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
  // AI LEVEL COUNT
  // ===================================================

  getAILevelCount(
    level: string
  ): number {

    return this.complaints.filter(

      complaint =>
        this.getAILevel(
          complaint
        ) === level

    ).length;

  }


  // ===================================================
  // AI LEVEL PERCENTAGE
  // ===================================================

  getAILevelPercentage(
    level: string
  ): number {

    if (
      this.totalComplaints === 0
    ) {

      return 0;

    }


    const count =
      this.getAILevelCount(
        level
      );


    return Math.round(

      (
        count /
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


    return level
      .toLowerCase()
      .trim();

  }


  // ===================================================
  // PRIORITY CLASS
  // ===================================================

  getPriorityClass(
    complaint: Complaint
  ): string {

    if (
      !complaint
    ) {

      return 'low';

    }


    const level =
      complaint.priorityLevel ||
      this.getAILevel(
        complaint
      );


    return level
      .toLowerCase()
      .trim();

  }


  // ===================================================
  // URGENT COMPLAINTS
  // ===================================================

  get urgentComplaints():
    Complaint[] {

    return [
      ...this.complaints
    ]

      .sort(

        (
          a,
          b
        ) => {

          const scoreA =
            Number(
              a.aiScore
            ) || 0;

          const scoreB =
            Number(
              b.aiScore
            ) || 0;


          return (
            scoreB -
            scoreA
          );

        }

      )

      .slice(
        0,
        5
      );

  }


  // ===================================================
  // TOTAL SIMILAR CASES
  // ===================================================

  get totalSimilarCases(): number {

    return this.complaints.reduce(

      (
        total,
        complaint
      ) => {

        return (

          total +
          (
            Number(
              complaint.similarComplaints
            ) || 0
          )

        );

      },

      0

    );

  }


  // ===================================================
  // TOP CATEGORY
  // ===================================================

  get topCategory(): string {

    if (
      this.complaints.length === 0
    ) {

      return 'No data';

    }


    const categoryCounts:
      {
        [key: string]: number
      } = {};


    this.complaints.forEach(

      complaint => {

        const category =
          complaint.category ||
          'Other';


        categoryCounts[
          category
        ] =
          (
            categoryCounts[
              category
            ] || 0
          ) + 1;

      }

    );


    let top =
      'Other';

    let highest =
      0;


    Object.keys(
      categoryCounts
    ).forEach(

      category => {

        if (
          categoryCounts[
            category
          ] > highest
        ) {

          highest =
            categoryCounts[
              category
            ];

          top =
            category;

        }

      }

    );


    return top;

  }


  // ===================================================
  // VIEW COMPLAINT
  // ===================================================

  viewComplaint(
    complaint: Complaint
  ): void {

    this.selectedComplaint =
      complaint;


    console.log(
      'Selected AI complaint:',
      complaint
    );

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
    date: string | Date | undefined
  ): string {

    if (!date) {

      return 'Not available';

    }


    const parsedDate =
      new Date(
        date
      );


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
  // GET AI REASONS
  // ===================================================

  getAIReasons(
    complaint: Complaint
  ): string[] {

    if (
      !complaint ||
      !Array.isArray(
        complaint.aiReasons
      )
    ) {

      return [];

    }


    return complaint.aiReasons;

  }


  // ===================================================
  // GET DETECTED FACTORS
  // ===================================================

  getDetectedFactors(
    complaint: Complaint
  ): string[] {

    if (
      !complaint ||
      !Array.isArray(
        complaint.detectedFactors
      )
    ) {

      return [];

    }


    return complaint.detectedFactors;

  }


  // ===================================================
  // GET RECOMMENDED ACTION
  // ===================================================

  getRecommendedAction(
    complaint: Complaint
  ): string {

    if (
      !complaint ||
      !complaint.recommendedAction
    ) {

      return 'No recommendation available.';

    }


    return complaint.recommendedAction;

  }


  // ===================================================
  // GET PREDICTED RESOLUTION TIME
  // ===================================================

  getPredictedResolutionTime(
    complaint: Complaint
  ): number {

    if (
      !complaint
    ) {

      return 0;

    }


    return Number(
      complaint.predictedResolutionTime
    ) || 0;

  }


  // ===================================================
  // GET RESOLUTION TIME LABEL
  // ===================================================

  getResolutionTimeLabel(
    complaint: Complaint
  ): string {

    const days =
      this.getPredictedResolutionTime(
        complaint
      );


    if (
      days <= 0
    ) {

      return 'Not available';

    }


    if (
      days === 1
    ) {

      return '1 day';

    }


    return `${days} days`;

  }


  // ===================================================
  // CHECK PHOTO
  // ===================================================

  hasPhoto(
    complaint: Complaint
  ): boolean {

    return !!(
      complaint &&
      complaint.photo &&
      complaint.photo.trim()
    );

  }


  // ===================================================
  // GET PHOTO URL
  // ===================================================

  getPhotoUrl(
    complaint: Complaint
  ): string {

    if (
      !this.hasPhoto(
        complaint
      )
    ) {

      return '';

    }


    return (
      'http://localhost:5000' +
      complaint.photo
    );

  }


  // ===================================================
  // GET STATUS
  // ===================================================

  getStatus(
    complaint: Complaint
  ): string {

    if (
      !complaint
    ) {

      return 'Pending';

    }


    return (
      complaint.status ||
      'Pending'
    );

  }


  // ===================================================
  // GET CATEGORY
  // ===================================================

  getCategory(
    complaint: Complaint
  ): string {

    return (
      complaint?.category ||
      'Other'
    );

  }


  // ===================================================
  // GET SEVERITY
  // ===================================================

  getSeverity(
    complaint: Complaint
  ): number {

    return (
      Number(
        complaint?.severity
      ) || 0
    );

  }


  // ===================================================
  // GET SIMILAR COUNT
  // ===================================================

  getSimilarCount(
    complaint: Complaint
  ): number {

    return (
      Number(
        complaint?.similarComplaints
      ) || 0
    );

  }


  // ===================================================
  // GET LOCATION
  // ===================================================

  getLocation(
    complaint: Complaint
  ): string {

    return (
      complaint?.location?.address ||
      'Location unavailable'
    );

  }

}