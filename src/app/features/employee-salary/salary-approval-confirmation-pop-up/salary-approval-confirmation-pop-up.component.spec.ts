import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryApprovalConfirmationPopUpComponent } from './salary-approval-confirmation-pop-up.component';

describe('SalaryApprovalConfirmationPopUpComponent', () => {
  let component: SalaryApprovalConfirmationPopUpComponent;
  let fixture: ComponentFixture<SalaryApprovalConfirmationPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryApprovalConfirmationPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryApprovalConfirmationPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
