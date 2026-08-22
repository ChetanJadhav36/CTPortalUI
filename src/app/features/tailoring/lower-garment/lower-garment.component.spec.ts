import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowerGarmentComponent } from './lower-garment.component';

describe('LowerGarmentComponent', () => {
  let component: LowerGarmentComponent;
  let fixture: ComponentFixture<LowerGarmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowerGarmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowerGarmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
