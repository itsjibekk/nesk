import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryradarComponent } from './categoryradar.component';

describe('CategoryradarComponent', () => {
  let component: CategoryradarComponent;
  let fixture: ComponentFixture<CategoryradarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryradarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryradarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
