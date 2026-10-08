import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCitizens } from './admin-citizens';

describe('AdminCitizens', () => {
  let component: AdminCitizens;
  let fixture: ComponentFixture<AdminCitizens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCitizens],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCitizens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
