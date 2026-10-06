import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salary-adjustment-pop-up',
  standalone: true,
  imports: [CommonModule,ModalComponent,ModalHeaderComponent,ModalTitleDirective,ModalBodyComponent,ModalFooterComponent,FormsModule],
  templateUrl: './salary-adjustment-pop-up.component.html',
  styleUrl: './salary-adjustment-pop-up.component.scss'
})
export class SalaryAdjustmentPopUpComponent {
  public visiblePopup = false;
  salary: any = null;
  otherDeductionAmount: number = 0;
  otherDeductionAmtRemark: string = '';
  otherAdditionalAmount: number = 0;
  otherAdditionalAmtRemark: string = '';
  validationMessage = '';

  @Output() submitted = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  open(salary: any): void {
    this.salary = salary;
    this.otherDeductionAmount = salary?.otherDeductionAmount || 0;
    this.otherDeductionAmtRemark = salary?.otherDeductionAmtRemark || '';

    this.otherAdditionalAmount = salary?.otherAdditionalAmount || 0;
    this.otherAdditionalAmtRemark = salary?.otherAdditionalAmtRemark || '';

    this.visiblePopup = true;
  }

  close(): void {
    this.visiblePopup = false;
    this.closed.emit();
  }

  handleVisibleChange(event: boolean): void {
    this.visiblePopup = event;
  }

  submit(): void {
  this.validationMessage = '';

  const deductionReason = this.otherDeductionAmtRemark?.trim() || '';
  const additionalReason = this.otherAdditionalAmtRemark?.trim() || '';
  
  const deductionAmount = Number(this.otherDeductionAmount) || 0;
  const additionalAmount = Number(this.otherAdditionalAmount) || 0; 

  // Validate deduction
  if (deductionAmount > 0 && !deductionReason) {
    this.validationMessage =
      'Please enter a reason for the Other Deduction Amount.';
    return;
  }

  // Validate additional
  if (additionalAmount > 0 && !additionalReason) {
    this.validationMessage =
      'Please enter a reason for the Other Additional Amount.';
    return;
  }

  // Optional: prevent negative amounts
  if (deductionAmount < 0) {
    this.validationMessage =
      'Other Deduction Amount cannot be negative.';
    return;
  }

  if (additionalAmount < 0) {
    this.validationMessage =
      'Other Additional Amount cannot be negative.';
    return;
  }

  const payload = {
    tempSalaryId: this.salary.id,
    employeeId: this.salary.employeeId,

    otherDeductionAmount: deductionAmount,
    otherDeductionAmtRemark: deductionReason || null,

    otherAdditionalAmount: additionalAmount,
    otherAdditionalAmtRemark: additionalReason || null
  };

  this.submitted.emit(payload);
  this.visiblePopup = false;
  }
 
}
