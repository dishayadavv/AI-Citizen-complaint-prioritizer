import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMap } from './admin-map';

describe('AdminMap', () => {
  let component: AdminMap;
  let fixture: ComponentFixture<AdminMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMap],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
