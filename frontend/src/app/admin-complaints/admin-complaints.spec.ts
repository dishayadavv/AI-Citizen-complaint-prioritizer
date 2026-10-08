import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComplaints } from './admin-complaints';

describe('AdminComplaints', () => {
  let component: AdminComplaints;
  let fixture: ComponentFixture<AdminComplaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComplaints],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComplaints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
