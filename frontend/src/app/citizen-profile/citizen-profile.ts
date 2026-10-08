import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-citizen-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './citizen-profile.html',
  styleUrl: './citizen-profile.css'
})
export class CitizenProfile {

  citizen: any = null;

  constructor(
    private router: Router
  ) {
    this.loadCitizen();
  }

  loadCitizen(): void {

    const savedCitizen =
      localStorage.getItem('cityfixCitizen') ||
      localStorage.getItem('citizen');

    if (savedCitizen) {

      try {

        this.citizen =
          JSON.parse(savedCitizen);

      } catch (error) {

        console.error(
          'Unable to load citizen profile:',
          error
        );

      }

    }

  }

  get citizenName(): string {
    return this.citizen?.name || 'Citizen';
  }

  get citizenEmail(): string {
    return this.citizen?.email || 'Not available';
  }

  get citizenPhone(): string {
    return this.citizen?.phone || 'Not available';
  }

  get citizenAddress(): string {
    return this.citizen?.address || 'Not available';
  }

  get citizenCity(): string {
    return this.citizen?.city || 'Not available';
  }

  logout(): void {

    localStorage.removeItem('citizen');
    localStorage.removeItem('citizenEmail');
    localStorage.removeItem('cityfixCitizen');
    localStorage.removeItem('cityfixCitizenId');

    this.router.navigate(['/']);

  }

}