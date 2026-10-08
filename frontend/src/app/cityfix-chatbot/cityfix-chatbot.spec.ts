import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CityfixChatbot } from './cityfix-chatbot';

describe('CityfixChatbot', () => {
  let component: CityfixChatbot;
  let fixture: ComponentFixture<CityfixChatbot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityfixChatbot],
    }).compileComponents();

    fixture = TestBed.createComponent(CityfixChatbot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
