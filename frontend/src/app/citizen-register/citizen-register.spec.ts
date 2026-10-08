import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenRegister } from './citizen-register';

describe('CitizenRegister', () => {
  let component: CitizenRegister;
  let fixture: ComponentFixture<CitizenRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(CitizenRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
