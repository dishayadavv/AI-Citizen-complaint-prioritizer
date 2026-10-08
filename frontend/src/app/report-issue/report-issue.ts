import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-issue',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './report-issue.html',
  styleUrl: './report-issue.css'
})
export class ReportIssue {

  // =====================================================
  // API
  // =====================================================

  private apiUrl =
    'http://localhost:5000/api/complaints';


  // =====================================================
  // FORM DATA
  // =====================================================

  issue = {

    title: '',

    category: '',

    severity: null as number | null,

    description: '',

    location: '',

    photo: null as File | null

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // FILE SELECTED
  // =====================================================

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      const selectedFile =
        input.files[0];


      // -------------------------------------------------
      // CHECK FILE TYPE
      // -------------------------------------------------

      const allowedTypes = [

        'image/jpeg',

        'image/jpg',

        'image/png',

        'image/webp'

      ];


      if (
        !allowedTypes.includes(
          selectedFile.type
        )
      ) {

        alert(
          'Please select a JPG, JPEG, PNG or WEBP image.'
        );


        input.value = '';

        this.issue.photo = null;

        return;

      }


      // -------------------------------------------------
      // CHECK FILE SIZE
      // -------------------------------------------------

      const maxSize =
        5 * 1024 * 1024;


      if (
        selectedFile.size > maxSize
      ) {

        alert(
          'Image size must be less than 5 MB.'
        );


        input.value = '';

        this.issue.photo = null;

        return;

      }


      // -------------------------------------------------
      // SAVE FILE
      // -------------------------------------------------

      this.issue.photo =
        selectedFile;


      console.log(
        'Selected photo:',
        selectedFile.name
      );

    }

  }


  // =====================================================
  // SUBMIT REPORT
  // =====================================================

  submitReport(): void {

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (

      !this.issue.title.trim() ||

      !this.issue.category ||

      !this.issue.severity ||

      !this.issue.description.trim() ||

      !this.issue.location.trim()

    ) {

      alert(
        'Please fill in all required fields.'
      );

      return;

    }


    // ---------------------------------------------------
    // GET LOGGED-IN CITIZEN
    // ---------------------------------------------------

    const storedCitizen =
      localStorage.getItem(
        'cityfixCitizen'
      );


    let citizen: any = null;


    if (storedCitizen) {

      try {

        citizen =
          JSON.parse(
            storedCitizen
          );

      }

      catch (error) {

        console.error(
          'Could not read citizen information:',
          error
        );

      }

    }


    // ---------------------------------------------------
    // CREATE FORM DATA
    // ---------------------------------------------------

    const formData =
      new FormData();


    // ---------------------------------------------------
    // BASIC COMPLAINT DATA
    // ---------------------------------------------------

    formData.append(
      'title',
      this.issue.title.trim()
    );


    formData.append(
      'description',
      this.issue.description.trim()
    );


    formData.append(
      'category',
      this.issue.category
    );


    formData.append(
      'severity',
      String(this.issue.severity)
    );


    // ---------------------------------------------------
    // LOCATION
    // ---------------------------------------------------

    formData.append(
      'location',
      JSON.stringify({

        address:
          this.issue.location.trim()

      })
    );


    // ---------------------------------------------------
    // CITIZEN
    // ---------------------------------------------------

    formData.append(
      'citizen',
      JSON.stringify({

        name:
          citizen?.name ||
          'Unknown Citizen',

        email:
          citizen?.email ||
          '',

        phone:
          citizen?.phone ||
          ''

      })
    );


    // ---------------------------------------------------
    // PHOTO
    // ---------------------------------------------------

    if (this.issue.photo) {

      formData.append(
        'photo',
        this.issue.photo,
        this.issue.photo.name
      );

      console.log(
        'Photo attached:',
        this.issue.photo.name
      );

    }


    // ---------------------------------------------------
    // DEBUG
    // ---------------------------------------------------

    console.log(
      'Submitting complaint with photo:',
      !!this.issue.photo
    );


    // ---------------------------------------------------
    // SEND TO BACKEND
    // ---------------------------------------------------

    this.http
      .post(
        this.apiUrl,
        formData
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (response) => {

          console.log(
            'Complaint submitted successfully:',
            response
          );


          alert(
            '✅ Your issue has been reported successfully!'
          );


          // ---------------------------------------------
          // CLEAR FORM
          // ---------------------------------------------

          this.issue = {

            title: '',

            category: '',

            severity: null,

            description: '',

            location: '',

            photo: null

          };

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'Error submitting complaint:',
            error
          );


          alert(
            error?.error?.message ||
            '❌ Could not submit the complaint. Please make sure the backend is running.'
          );

        }

      });

  }

}