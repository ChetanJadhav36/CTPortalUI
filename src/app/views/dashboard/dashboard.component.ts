import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FinanceService } from '../../services/finance.service';
import { ToastService } from '../../services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [FormsModule]
})
export class DashboardComponent implements OnInit {
  notesData:any = {};  
  companyId: any;
  dashboard: any = {
  expenseApprovalPending: 0,
  expenseApprovalAmount: 0,
  expensePaymentPending: 0,
  expensePaymentAmount: 0,

  advanceApprovalPending: 0,
  advanceApprovalAmount: 0,
  advancePaymentPending: 0,
  advancePaymentAmount: 0,

  salaryApprovalPending: 0,
  salaryApprovalAmount: 0,
  salaryPaymentPending: 0,
  salaryPaymentAmount: 0
};
   constructor(        
    private authService: AuthService,      
    private financeService: FinanceService,
    private toastService:ToastService    
  ) {
      const authData = this.authService.getUserAuthData();
      if (authData && authData.userId) {   
        this.companyId = authData.client.clientId;        
      } 
  } 
  ngOnInit(): void {
    this.getNotesDenominations(this.companyId);
    this.loadDashboardSummary();
  }
  getNotesDenominations(companyId: any): void {
  this.financeService.GetNotesDenominations(companyId)
    .subscribe({
      next: (res: any[]) => {
        this.notesData = res;          
      },
      error: (error) => {
        this.toastService.error(
          error?.error?.message || 'Error loading notes denominations'
        );
      }
    });
} 
loadDashboardSummary(): void { 
  forkJoin({
    voucher: this.financeService.getVoucherTransactionsDashboardSummary(this.companyId),
    advance: this.financeService.getEmployeeAdvancesDashboardSummary(this.companyId),
    salary: this.financeService.getSalaryDashboardSummary(this.companyId)
  }).subscribe({
    next: (response: any) => {      
      // Expenses
      this.dashboard.expenseApprovalPending =
        response.voucher?.draftPendingCount ?? 0;

      this.dashboard.expenseApprovalAmount =
        response.voucher?.draftPendingAmount ?? 0;

      this.dashboard.expensePaymentPending =
        response.voucher?.paymentPendingCount ?? 0;

      this.dashboard.expensePaymentAmount =
        response.voucher?.paymentPendingAmount ?? 0;


      // Advances
      this.dashboard.advanceApprovalPending =
        response.advance?.draftPendingCount ?? 0;

      this.dashboard.advanceApprovalAmount =
        response.advance?.draftPendingAmount ?? 0;

      this.dashboard.advancePaymentPending =
        response.advance?.paymentPendingCount ?? 0;

      this.dashboard.advancePaymentAmount =
        response.advance?.paymentPendingAmount ?? 0;


      // Salaries
      this.dashboard.salaryApprovalPending =
        response.salary?.draftPendingCount ?? 0;

      this.dashboard.salaryApprovalAmount =
        response.salary?.draftPendingAmount ?? 0;

      this.dashboard.salaryPaymentPending =
        response.salary?.paymentPendingCount ?? 0;

      this.dashboard.salaryPaymentAmount =
        response.salary?.paymentPendingAmount ?? 0;

    },
    error: (error) => {
      this.toastService.error(
        error?.error?.message || 'Failed to load dashboard summary'
      );
    }
  });

} 
}
