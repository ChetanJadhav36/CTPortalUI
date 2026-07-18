import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalConfirmationPopUpComponent } from './approval-confirmation-pop-up.component';

describe('ApprovalConfirmationPopUpComponent', () => {
  let component: ApprovalConfirmationPopUpComponent;
  let fixture: ComponentFixture<ApprovalConfirmationPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalConfirmationPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalConfirmationPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
