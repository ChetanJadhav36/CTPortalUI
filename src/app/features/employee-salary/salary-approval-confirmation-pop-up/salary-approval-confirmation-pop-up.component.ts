import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { FinanceService } from '../../../services/finance.service';
import { ButtonCloseDirective, ButtonDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective } from '@coreui/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salary-approval-confirmation-pop-up',
  standalone: true,
  imports: [CommonModule,ButtonDirective,ModalComponent,ModalHeaderComponent,ModalTitleDirective,ButtonCloseDirective,ModalBodyComponent,ModalFooterComponent,FormsModule],
  templateUrl: './salary-approval-confirmation-pop-up.component.html',
  styleUrl: './salary-approval-confirmation-pop-up.component.scss'
})
export class SalaryApprovalConfirmationPopUpComponent {
   public visiblePopup = false;
  approvalData: any = {};

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<any>();

  constructor(
    private toastService: ToastService
  ) {}

  open(data: any): void {
    this.approvalData = data;
    this.visiblePopup = true;
  }

  close(): void {
    this.visiblePopup = false;
    this.closed.emit();
  }

  handleVisibleChange(event: boolean): void {
    this.visiblePopup = event;
  }

  confirmApproval(): void {
    this.confirmed.emit(this.approvalData);
    this.visiblePopup = false;
  }  
}
