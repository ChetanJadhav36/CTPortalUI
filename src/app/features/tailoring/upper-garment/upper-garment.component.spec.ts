import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpperGarmentComponent } from './upper-garment.component';

describe('UpperGarmentComponent', () => {
  let component: UpperGarmentComponent;
  let fixture: ComponentFixture<UpperGarmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpperGarmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpperGarmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
