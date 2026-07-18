import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective
} from '@coreui/angular';
import { FinanceService } from '../../../services/finance.service';
import { ToastService } from '../../../services/toast.service';
import { VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-approval-confirmation-pop-up',
  standalone: true,
  imports: [CommonModule,ButtonDirective,ModalComponent,ModalHeaderComponent,ModalTitleDirective,ButtonCloseDirective,ModalBodyComponent,ModalFooterComponent],
  templateUrl: './approval-confirmation-pop-up.component.html'
})
export class ApprovalConfirmationPopUpComponent {
 public visiblePopup = false;
  transactionData: any;
  @Output() closed = new EventEmitter<void>();

   constructor(      
      private toastService: ToastService,
      private financeService: FinanceService,      
    ) {      
    }  

  open(data: any) {
    this.transactionData = data;
    this.visiblePopup = true;
  }

  close() {
    this.closed.emit();
    this.visiblePopup = false;
  }

  handleVisibleChange(event: boolean) {
    this.visiblePopup = event;
  }

  confirmApproval() {    
    if (this.transactionData.voucherType === 'EXP' || this.transactionData.voucherType === 'DEP') {
      this.onApproveVoucherTransactions();
    }       
    else if(this.transactionData.voucherType === 'ADV') {
      this.onApproveEmployeeAdvances();
    }
    this.close();
  }
  // Approve Expense and Bank Deposit
  onApproveVoucherTransactions(){
    this.financeService.approveVoucherTransaction(this.transactionData).subscribe({
        next: (res: any) => {
          this.toastService.success(res?.message || 'Transaction approved successfully');
          this.close();
        },
        error: (err) => {
          console.error('Error approving transaction:', err);
          this.toastService.error(err?.error?.message || 'Error approving transaction');
        }
    });   
  }
  // Approve Employee Advance
  onApproveEmployeeAdvances(){
    this.financeService.approveEmployeeAdvance(this.transactionData).subscribe({
        next: (res: any) => {
          this.toastService.success(res?.message || 'Employee advance successfully');
          this.close();
        },
        error: (err) => {
          console.error('Error approving transaction:', err);
          this.toastService.error(err?.error?.message || 'Error approving transaction');
        }
    });   
  } 

}