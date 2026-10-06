import { Component, Injector, ViewChild } from '@angular/core';
import { PaymentType } from '../../../enums/permission.enum';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { ApprovalConfirmationPopUpComponent } from '../approval-confirmation-pop-up/approval-confirmation-pop-up.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-financial-entry-approval',
  standalone: true,
  imports: [CommonModule,IconDirective,TableModule,ApprovalConfirmationPopUpComponent ],
  templateUrl: './financial-entry-approval.component.html',
  styleUrl: './financial-entry-approval.component.scss'
})
export class FinancialEntryApprovalComponent {
companyId: any;
transactions: FinancialTransaction[] = [];
approvedTransactionData: any = null;
// Expose enum
PaymentType = PaymentType;

 @ViewChild(ApprovalConfirmationPopUpComponent)
popup!: ApprovalConfirmationPopUpComponent;
constructor(
  private financeService: FinanceService,
  private authService: AuthService,
  private router: Router
) {
  const authData = this.authService.getUserAuthData();
  if (authData && authData.userId) {
    this.companyId = authData.client?.clientId;
  }
}

ngOnInit() {
  this.getAllDraftTransactions();
}
/**
  * Fetch Expenses, Bank Deposits and Employee Advances
*/
getAllDraftTransactions() {
  forkJoin({
    expenses: this.financeService.getDraftExpenses(this.companyId),
    bankDeposits: this.financeService.getDraftBankDeposits(this.companyId),
    employeeAdvances: this.financeService.getDraftEmployeeAdvances(this.companyId)})
    .subscribe({
    next: (result: any) => {
      // Expense
      const expenses: FinancialTransaction[] =
        (result.expenses || []).map((item: any) => ({...item}));

      // Bank Deposit
      const bankDeposits: FinancialTransaction[] =
        (result.bankDeposits || []).map((item: any) => ({...item}));

      // Employee Advance
      const employeeAdvances: FinancialTransaction[] =
        (result.employeeAdvances || []).map((item: any) => ({
            id: item.id,
            voucherType: item.voucherType,
            voucherDate: item.voucherDate,
            voucherNumber: item.voucherNumber,

            sourceAccountId: item.sourceAccountId,
            sourceAccountName: item.sourceAccountName,

            // Map employee to destination
            destinationAccountName: item.employeeFullName,

            // Map advanceAmount to common amount
            amount: item.advanceAmount,

            paymentType: item.paymentType,
            status: item.status,
            transactionNo: null,
            narration: item.narration
        }));

      // Combine all
      this.transactions = [...expenses, ...bankDeposits, ...employeeAdvances
      ];      
    },
    error: (error: any) => {
      console.error(
        'Error fetching draft transactions:',
        error
      );
    }
  });
}

openPopup(data: any) {
  data.companyId = this.companyId; // Ensure companyId is included
    this.popup.open(data);    
}
onPopupClose() {
  this.getAllDraftTransactions();
}
}
interface FinancialTransaction {
  voucherDate: string;
  voucherNumber: string;
  voucherType: string;
  sourceAccountName: string;
  amount: number;
  destinationAccountName: string;
  paymentType: string;
  transactionNo: string;
  narration: string;
  status: string;
  approvedBy?: string;

  // Optional fields specifically for employee advance
  employeeId?: number;
  employeeFullName?: string;
}