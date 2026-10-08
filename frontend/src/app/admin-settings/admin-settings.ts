import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css'
})
export class AdminSettingsComponent {

  // =====================================================
  // SETTINGS
  // =====================================================

  emailNotifications = true;

  aiAnalysis = true;

  automaticPriority = true;

  similarComplaintDetection = true;

  showResolvedComplaints = true;

  darkMode = false;


  // =====================================================
  // SAVE
  // =====================================================

  saveSettings(): void {

    console.log('CityFix settings saved');

    console.log({
      emailNotifications: this.emailNotifications,
      aiAnalysis: this.aiAnalysis,
      automaticPriority: this.automaticPriority,
      similarComplaintDetection:
        this.similarComplaintDetection,
      showResolvedComplaints:
        this.showResolvedComplaints,
      darkMode: this.darkMode
    });

    alert('Settings saved successfully.');

  }


  // =====================================================
  // RESET
  // =====================================================

  resetSettings(): void {

    this.emailNotifications = true;

    this.aiAnalysis = true;

    this.automaticPriority = true;

    this.similarComplaintDetection = true;

    this.showResolvedComplaints = true;

    this.darkMode = false;

  }

}