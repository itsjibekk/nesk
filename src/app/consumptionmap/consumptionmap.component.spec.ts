import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionmapComponent } from './consumptionmap.component';

describe('ConsumptionmapComponent', () => {
  let component: ConsumptionmapComponent;
  let fixture: ComponentFixture<ConsumptionmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsumptionmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumptionmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
