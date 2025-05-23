import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencypieComponent } from './efficiencypie.component';

describe('EfficiencypieComponent', () => {
  let component: EfficiencypieComponent;
  let fixture: ComponentFixture<EfficiencypieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfficiencypieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfficiencypieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
