import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenProfile } from './citizen-profile';

describe('CitizenProfile', () => {
  let component: CitizenProfile;
  let fixture: ComponentFixture<CitizenProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(CitizenProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
