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
      next: (res: any) => {
        this.notesData = res;  
        this.notesData.totalNotesCount = [
            res.notes2000,
            res.notes1000,
            res.notes500,
            res.notes200,
            res.notes100,
            res.notes50,
            res.notes20,
            res.notes10,
            res.notes5,
            res.coins
          ].reduce((sum, value) => sum + (value || 0), 0);
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
    expenses: this.financeService.getExpenseDashboardSummary(this.companyId),
    bankDeposits: this.financeService.getBankDepositDashboardSummary(this.companyId),
    advances: this.financeService.getEmployeeAdvancesDashboardSummary(this.companyId),
    salaries: this.financeService.getSalaryDashboardSummary(this.companyId)
  }).subscribe({next: (response: any) => {        
      // Expenses
      this.dashboard.expenseApprovalPending = response.expenses?.draftPendingCount ?? 0;
      this.dashboard.expenseApprovalAmount = response.expenses?.draftPendingAmount ?? 0;
      this.dashboard.expensePaymentPending = response.expenses?.paymentPendingCount ?? 0;
      this.dashboard.expensePaymentAmount = response.expenses?.paymentPendingAmount ?? 0;

      // Bank Deposits
      this.dashboard.bankDepositApprovalPending = response.bankDeposits?.draftPendingCount ?? 0;
      this.dashboard.bankDepositApprovalAmount = response.bankDeposits?.draftPendingAmount ?? 0;
      this.dashboard.bankDepositPaymentPending = response.bankDeposits?.paymentPendingCount ?? 0;
      this.dashboard.bankDepositPaymentAmount = response.bankDeposits?.paymentPendingAmount ?? 0;

      // Advances
      this.dashboard.advanceApprovalPending = response.advances?.draftPendingCount ?? 0;
      this.dashboard.advanceApprovalAmount = response.advances?.draftPendingAmount ?? 0;
      this.dashboard.advancePaymentPending = response.advances?.paymentPendingCount ?? 0;
      this.dashboard.advancePaymentAmount = response.advances?.paymentPendingAmount ?? 0;

      // Salaries
      this.dashboard.salaryApprovalPending = response.salaries?.draftPendingCount ?? 0;
      this.dashboard.salaryApprovalAmount = response.salaries?.draftPendingAmount ?? 0;
      this.dashboard.salaryPaymentPending = response.salaries?.paymentPendingCount ?? 0;
      this.dashboard.salaryPaymentAmount = response.salaries?.paymentPendingAmount ?? 0;
    },
    error: (error) => {
      this.toastService.error(
        error?.error?.message || 'Failed to load dashboard summary'
      );
    }
  });

} 
}
