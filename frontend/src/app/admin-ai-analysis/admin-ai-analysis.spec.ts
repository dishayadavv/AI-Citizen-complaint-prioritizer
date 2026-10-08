import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAiAnalysis } from './admin-ai-analysis';

describe('AdminAiAnalysis', () => {
  let component: AdminAiAnalysis;
  let fixture: ComponentFixture<AdminAiAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAiAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAiAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
