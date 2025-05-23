import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadgaugeComponent } from './loadgauge.component';

describe('LoadgaugeComponent', () => {
  let component: LoadgaugeComponent;
  let fixture: ComponentFixture<LoadgaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadgaugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadgaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
