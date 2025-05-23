import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LosschartComponent } from './losschart.component';

describe('LosschartComponent', () => {
  let component: LosschartComponent;
  let fixture: ComponentFixture<LosschartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LosschartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LosschartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
