import { Routes } from '@angular/router';

import { citizenAuthGuard } from './guards/citizen-auth.guard';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [

  // ================================
  // CITIZEN REGISTER
  // ================================

  {
    path: 'citizen-register',
    loadComponent: () =>
      import('./citizen-register/citizen-register')
        .then(m => m.CitizenRegister)
  },


  // ================================
  // CITIZEN LOGIN
  // ================================

  {
    path: 'citizen-login',
    loadComponent: () =>
      import('./citizen-login/citizen-login')
        .then(m => m.CitizenLogin)
  },


  // ================================
  // REPORT ISSUE
  // ================================

  {
    path: 'report-issue',
    canActivate: [citizenAuthGuard],
    loadComponent: () =>
      import('./report-issue/report-issue')
        .then(m => m.ReportIssue)
  },


  // ================================
  // CITIZEN DASHBOARD
  // ================================

  {
    path: 'citizen-dashboard',
    canActivate: [citizenAuthGuard],
    loadComponent: () =>
      import('./citizen-dashboard/citizen-dashboard')
        .then(m => m.CitizenDashboard)
  },


  // ================================
  // TRACK COMPLAINT
  // Public page
  // ================================

  {
    path: 'track-complaint',
    loadComponent: () =>
      import('./track-complaint/track-complaint')
        .then(m => m.TrackComplaint)
  },


  // ================================
  // CITIZEN PROFILE
  // ================================

  {
    path: 'citizen-profile',
    canActivate: [citizenAuthGuard],
    loadComponent: () =>
      import('./citizen-profile/citizen-profile')
        .then(m => m.CitizenProfile)
  },


  // ================================
  // MY COMPLAINTS
  // ================================

  {
    path: 'my-complaints',
    canActivate: [citizenAuthGuard],
    loadComponent: () =>
      import('./my-complaints/my-complaints')
        .then(m => m.MyComplaints)
  },


  // ================================
  // ADMIN LOGIN
  // Public page
  // ================================

  {
    path: 'admin-login',
    loadComponent: () =>
      import('./admin-login/admin-login')
        .then(m => m.AdminLogin)
  },


  // ================================
  // ADMIN DASHBOARD
  // ================================

  {
    path: 'admin-dashboard',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboardComponent)
  },


  // ================================
  // ADMIN COMPLAINTS
  // ================================

  {
    path: 'admin-complaints',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-complaints/admin-complaints')
        .then(m => m.AdminComplaintsComponent)
  },


  // ================================
  // ADMIN AI ANALYSIS
  // ================================

  {
    path: 'admin-ai-analysis',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-ai-analysis/admin-ai-analysis')
        .then(m => {

          const component =
            (m as any).AdminAiAnalysisComponent ??
            (m as any).AdminAiAnalysis;

          return component;

        })
  },


  // ================================
  // ADMIN ANALYTICS
  // ================================

  {
    path: 'admin-analytics',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-analytics/admin-analytics')
        .then(m => m.AdminAnalyticsComponent)
  },


  // ================================
  // ADMIN CITIZENS
  // ================================

  {
    path: 'admin-citizens',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-citizens/admin-citizens')
        .then(m => {

          const component =
            (m as any).AdminCitizensComponent ??
            (m as any).AdminCitizens;

          return component;

        })
  },


  // ================================
  // ADMIN LOCATIONS
  // ================================

  {
    path: 'admin-locations',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-locations/admin-locations')
        .then(m => {

          const component =
            (m as any).AdminLocationsComponent ??
            (m as any).AdminLocations;

          return component;

        })
  },


  // ================================
  // ADMIN MAP
  // ================================

  {
    path: 'admin-map',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-map/admin-map')
        .then(m => {

          const component =
            (m as any).AdminMapComponent ??
            (m as any).AdminMap;

          return component;

        })
  },


  // ================================
  // ADMIN SETTINGS
  // ================================

  {
    path: 'admin-settings',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin-settings/admin-settings')
        .then(m => {

          const component =
            (m as any).AdminSettingsComponent ??
            (m as any).AdminSettings;

          return component;

        })
  }

];