import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeanalysisComponent } from './timeanalysis.component';

describe('TimeanalysisComponent', () => {
  let component: TimeanalysisComponent;
  let fixture: ComponentFixture<TimeanalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeanalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeanalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
