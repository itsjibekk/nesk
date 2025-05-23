import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencygaugeComponent } from './efficiencygauge.component';

describe('EfficiencygaugeComponent', () => {
  let component: EfficiencygaugeComponent;
  let fixture: ComponentFixture<EfficiencygaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfficiencygaugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfficiencygaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
