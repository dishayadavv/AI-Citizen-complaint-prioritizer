import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitizenLogin } from './citizen-login';

describe('CitizenLogin', () => {
  let component: CitizenLogin;
  let fixture: ComponentFixture<CitizenLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(CitizenLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
