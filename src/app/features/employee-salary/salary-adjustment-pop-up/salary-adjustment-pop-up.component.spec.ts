import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryAdjustmentPopUpComponent } from './salary-adjustment-pop-up.component';

describe('SalaryAdjustmentPopUpComponent', () => {
  let component: SalaryAdjustmentPopUpComponent;
  let fixture: ComponentFixture<SalaryAdjustmentPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryAdjustmentPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryAdjustmentPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
