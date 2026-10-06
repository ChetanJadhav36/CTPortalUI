import { Component } from '@angular/core';
import { PaymentType } from '../../../enums/permission.enum';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../../services/master.service';

@Component({
  selector: 'app-pay-salary',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './pay-salary.component.html',
  styleUrl: './pay-salary.component.scss'
})
export class PaySalaryComponent {
companyId: any;
accounts: any[] = [];
bankAccounts: any[] = [];
sourceAccountId: any = null;
salaryId: any;
salaryData: any;
employeeId: any;
PaymentType = PaymentType;
referenceNumber: string = '';
paymentDetails = {
    paymentType: PaymentType.Cash,
    bankAccountId: '',
    bankName: '',
    referenceNumber: ''
  };

cashNotesForm = new FormGroup({
  notes2000: new FormControl<number | null>(null),
  notes500: new FormControl<number | null>(null),
  notes200: new FormControl<number | null>(null),
  notes100: new FormControl<number | null>(null),
  notes50: new FormControl<number | null>(null),
  notes20: new FormControl<number | null>(null),
  notes10: new FormControl<number | null>(null),
  notes5: new FormControl<number | null>(null),
  coins: new FormControl<number | null>(null)
});

constructor(
  private masterService: MasterService,
  private financeService: FinanceService,
  private authService: AuthService,
  private route: ActivatedRoute,
  private router: Router,
  private toastService: ToastService
) {
const authData = this.authService.getUserAuthData();
if (authData) {
  this.companyId = authData.client?.clientId;
}
}

ngOnInit(): void {
  this.salaryId = this.route.snapshot.paramMap.get('salaryId');
  this.employeeId = this.route.snapshot.paramMap.get('employeeId');
  // Load accounts first
  this.getAccountsByCompanyId();

  this.getEmployeeSalaryById();
  }
  getAccountsByCompanyId(): void {
      this.masterService.getAccountsByCompanyId(this.companyId)
        .subscribe({ next: (res: any[]) => {
            this.accounts = res || [];
            // Only BNK accounts are available for Bank payment
            this.bankAccounts = this.accounts.filter(acc => acc.accountGroupCode === 'BNK');
            // Default payment mode = Cash
            this.setCashSourceAccount();
          },
          error: (err) => {
            this.toastService.error(
              err?.error?.message || 'Error loading accounts'
            );
          }
        });
  }
  private setCashSourceAccount(): void {
    const cashAccount = this.accounts.find(acc => acc.accountCode === 'CIH');
    if (!cashAccount) {
      this.sourceAccountId = null;
      this.toastService.error('Cash In Hand account (CIH) not found');
      return;
    }
    this.sourceAccountId = cashAccount.id;
    // Clear bank selection
    this.paymentDetails.bankAccountId = '';
    this.paymentDetails.bankName = '';
  }
  private getDefaultBankAccount(): any {
    return this.bankAccounts.find(acc => acc.isDefault === true) || this.bankAccounts[0] || null;
  }
  private setBankSourceAccount(): void {
    let account = this.bankAccounts.find( acc => Number(acc.id) === Number(this.paymentDetails.bankAccountId));

    // If nothing selected, use default bank account
    if (!account) {
      account = this.getDefaultBankAccount();
    }

    if (!account) {
      this.sourceAccountId = null;
      this.paymentDetails.bankName = '';
      return;
    }

    this.paymentDetails.bankAccountId = account.id;
    this.sourceAccountId = account.id;
    this.paymentDetails.bankName = account.accountName;
  }

  // ============================================================
  // BANK ACCOUNT CHANGE
  // ============================================================
  onBankAccountChange(): void {
    const accountId = this.paymentDetails.bankAccountId;
    const selectedAccount = this.bankAccounts.find(
        acc => Number(acc.id) === Number(accountId));

    if (!selectedAccount) {
      this.sourceAccountId = null;
      this.paymentDetails.bankName = '';
      return;
    }

    // Selected bank account becomes source account
    this.sourceAccountId =
      selectedAccount.id;

    this.paymentDetails.bankName =
      selectedAccount.accountName;
  }
  
  getEmployeeSalaryById() {
    const payload = {
      salaryId: Number(this.salaryId),
      employeeId: Number(this.employeeId),
      companyId: this.companyId
    };
    this.financeService.getEmployeeSalaryById(payload)
      .subscribe({
        next: (res: any) => {
          this.salaryData = res;
          if (this.salaryData == null) {
            this.toastService.warning('Salary data not found');
          }
        },
        error: (err) => {
          this.toastService.error(
            err?.error?.message ||
            'Error loading salary data'
          );
        }
      });
  }
// PAYMENT TYPE CHANGE
onPaymentTypeChange(): void {
    const paymentType = Number(this.paymentDetails.paymentType);
    if (paymentType === PaymentType.Cash) {
      // Cash => CIH
      this.setCashSourceAccount();
      // Enable cash notes
      this.cashNotesForm.enable();
    } else if (paymentType === PaymentType.Bank) {      
      this.setBankSourceAccount();
      // Disable cash notes
      this.cashNotesForm.disable();      
    }
}

getNotesCountTotal(): number {
    const val = this.cashNotesForm.getRawValue();
    return (
      (val.notes2000 || 0) +
      (val.notes500 || 0) +
      (val.notes200 || 0) +
      (val.notes100 || 0) +
      (val.notes50 || 0) +
      (val.notes20 || 0) +
      (val.notes10 || 0) +
      (val.notes5 || 0) +
      (val.coins || 0)
    );
  }
  // NOTES TOTAL AMOUNT
  getNotesTotal(): number {
      const val = this.cashNotesForm.getRawValue();
      return (
        ((val.notes2000 || 0) * 2000) +
        ((val.notes500 || 0) * 500) +
        ((val.notes200 || 0) * 200) +
        ((val.notes100 || 0) * 100) +
        ((val.notes50 || 0) * 50) +
        ((val.notes20 || 0) * 20) +
        ((val.notes10 || 0) * 10) +
        ((val.notes5 || 0) * 5) +
        (val.coins || 0)
      );
  }

  focusNext(next: HTMLElement) {
      next.focus();
  }

  isAmountMismatch(): boolean {
    const paymentType = Number(this.paymentDetails.paymentType);
    // Bank payment does not require cash-note validation
    if (paymentType === PaymentType.Bank) {
      return false;
    }

    const salaryAmount = Number(this.salaryData?.netPayableSalary || 0);
    const cashTotal = this.getNotesTotal();
    return salaryAmount !== cashTotal;
  }  

private prepareCashNotesData(): any {
  const data = this.cashNotesForm.getRawValue();

  return {
    ...data,
    notes2000: data.notes2000 ?? 0,    
    notes500: data.notes500 ?? 0,
    notes200: data.notes200 ?? 0,
    notes100: data.notes100 ?? 0,
    notes50: data.notes50 ?? 0,
    notes20: data.notes20 ?? 0,
    notes10: data.notes10 ?? 0,
    notes5: data.notes5 ?? 0,
    coins: data.coins ?? 0
  };
}


  onPayAmount(): void {
    const paymentType = Number(this.paymentDetails.paymentType);
    
    if (!this.sourceAccountId) {
        this.toastService.error(paymentType === PaymentType.Cash ? 'Cash In Hand account not found': 'Please select a bank account');
      return;
    }
    if (paymentType === PaymentType.Bank && !this.paymentDetails.bankAccountId) {
        this.toastService.error('Please select a bank account');
      return;
    }

    if ( paymentType === PaymentType.Cash && this.isAmountMismatch()) {
        this.toastService.error('Cash notes total must match Salary Amount');
      return;
    }

    const isConfirmed = confirm('Are you sure you want to pay this salary?');
    if (!isConfirmed) {
      return;
    }
    const cashNotes = this.prepareCashNotesData();

    const payload = {
      companyId: this.companyId,
      employeeId: this.salaryData.employeeId,
      salaryGenerationId: Number(this.salaryId),
      amount: this.salaryData.netPayableSalary,
      paymentType: paymentType,
      // IMPORTANT
      sourceAccountId: this.sourceAccountId,
      bankAccountId: paymentType === PaymentType.Bank ? this.paymentDetails.bankAccountId: null,
      bankName: paymentType === PaymentType.Bank ? this.paymentDetails.bankName : null,
      referenceNumber: paymentType === PaymentType.Bank ? this.paymentDetails.referenceNumber : null,

      // Cash notes
      notes2000: cashNotes.notes2000,
      notes500: cashNotes.notes500,
      notes200: cashNotes.notes200,
      notes100: cashNotes.notes100,
      notes50: cashNotes.notes50,
      notes20: cashNotes.notes20,
      notes10: cashNotes.notes10,
      notes5: cashNotes.notes5,
      coins: cashNotes.coins
    };
    this.financeService.payEmployeeSalary(payload)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(res?.message || 'Salary paid successfully');
          this.router.navigate(['/employee-salary/pay-salaries']);
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ||'Error paying salary');
        }
      });
  }
}
