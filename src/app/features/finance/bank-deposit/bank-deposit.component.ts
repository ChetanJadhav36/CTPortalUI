import { ChangeDetectorRef, Component } from '@angular/core';
import { PaymentType, TransactionStatus, VoucherType } from '../../../enums/permission.enum';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { FinanceService } from '../../../services/finance.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { of, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bank-deposit',
  standalone: true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './bank-deposit.component.html',
  styleUrl: './bank-deposit.component.scss'
})
export class BankDepositComponent {
  companyId: any;
  accounts: any[] = [];
  bankAccounts: any[] = [];  
  
   // Expose the enum to the template
  PaymentType = PaymentType;  // <-- THIS IS CRUCIAL
  VoucherType = VoucherType;  // <-- THIS IS CRUCIAL
  TransactionStatus = TransactionStatus;  // <-- THIS IS CRUCIAL

  draftForm = new FormGroup({
  id: new FormControl(0),
  companyId: new FormControl(''),

  voucherDate: new FormControl('', Validators.required),
  voucherNumber: new FormControl({ value: 0, disabled: true }),  

  sourceAccountId: new FormControl('', Validators.required),
  sourceAccountCode: new FormControl({ value: '', disabled: true }),
  sourceAccountName: new FormControl(''),

  destinationAccountId: new FormControl('', Validators.required),   // Received In
  destinationAccountName: new FormControl(''),

  entryType: new FormControl({ value: '', disabled: true }),
  accountGroupId: new FormControl('', Validators.required),  

  amount: new FormControl(null, [Validators.required, Validators.min(0)]),
  narration: new FormControl(''),  
  
  approvedBy: new FormControl({ value: null, disabled: true }),
  approvedDate: new FormControl({ value: null, disabled: true }),
  approvedByName: new FormControl({ value: '', disabled: true }),
  
  paidBy: new FormControl({ value: null, disabled: true }),
  paidByName: new FormControl({ value: '', disabled: true }),

  // Bank
  bankName: new FormControl(''),
  chequeNumber: new FormControl(''),
  remark: new FormControl(''),

  createdByName: new FormControl({ value: '', disabled: true }),
  transactionStatus: new FormControl('Draft'), // Default to Draft

  voucherType: new FormControl(VoucherType.DEP), // Default to DEP
  paymentType: new FormControl(PaymentType.Cash),
});

cashNotesForm = new FormGroup({ 
  id: new FormControl(0), // or transactionId
  voucherId: new FormControl(0),
  companyId: new FormControl(0),
  voucherType: new FormControl(VoucherType.DEP),
  paymentType: new FormControl(PaymentType.Cash),

  // Cash
  notes2000: new FormControl(0),
  notes1000: new FormControl(0),
  notes500: new FormControl(0),
  notes200: new FormControl(0),
  notes100: new FormControl(0),
  notes50: new FormControl(0),
  notes20: new FormControl(0),
  notes10: new FormControl(0),
  notes5: new FormControl(0),
  coins: new FormControl(0),  
});

  isUpdateMode: boolean = false;
  expenseId: any;
  isCashMode: boolean = false;
  constructor(
    private masterService: MasterService,    
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private financeService: FinanceService,
    private dateUtcPipe: DateUtcPipe,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
  }
  ngOnInit(): void {
  this.cashNotesForm.disable();
  // Set default date
  this.draftForm.patchValue({
    voucherDate: this.dateUtcPipe.transform(new Date(), 'input')
  });

  // Payment type change
  this.draftForm.get('paymentType')?.valueChanges.subscribe(value => {
    this.onPaymentTypeChange(value);
  });

  this.expenseId = this.route.snapshot.paramMap.get('id');
  this.isUpdateMode = !!this.expenseId;

  // SEQUENTIAL FLOW
  this.masterService.getAccountsByCompanyId(this.companyId).pipe(
    tap((accounts: any[]) => {
      this.accounts = accounts;
      this.bankAccounts = accounts.filter(
        a =>
          a.accountGroupCode === 'BNK' ||
          a.accountGroupName?.toLowerCase() === 'bank accounts'
      );
      this.setDefaultAccounts();
    }),
    switchMap(() => {
      if (this.isUpdateMode) {
        return this.financeService.getVoucherTransactionById({
          id: this.expenseId,
          companyId: this.companyId,
          voucherType: VoucherType.DEP
        });
      }
      return of(null);
    })
  ).subscribe({
    next: (expenseData: any) => {
      if (expenseData) {        
        this.patchExpense(expenseData);
      }

      // Run AFTER everything is ready
      this.onPaymentTypeChange(this.draftForm.get('paymentType')?.value);
      this.toggleFormsBasedOnTransactionStatus();

      this.cd.detectChanges();
    },
    error: (err) => {
      this.toastService.error(err?.error?.message || 'Error loading data');
    }
  });
}
setDefaultAccounts() {
  // Paid From = Cash In Hand
  const cashInHand = this.accounts.find(a => a.accountCode === 'CIH');

  if (cashInHand) {
    this.draftForm.patchValue({
      sourceAccountId: cashInHand.id,
      sourceAccountCode: cashInHand.accountCode,
      sourceAccountName: cashInHand.accountName
    });

    this.draftForm.get('sourceAccountId')?.disable();
  }

  // Credit Account default = first bank account
  const bankAccount = this.accounts.find(a => a.accountCode === 'BNK');

  if (bankAccount) {
    this.draftForm.patchValue({
      destinationAccountId: bankAccount.id,
      destinationAccountName: bankAccount.accountName,
      entryType: bankAccount.accountGroupName,
      accountGroupId: bankAccount.accountGroupId
    });
  }
}
onDestinationAccountChange() {

  const accountId =
    Number(this.draftForm.get('destinationAccountId')?.value);

  const account = this.accounts.find(a => a.id === accountId);

  if (!account) return;

  this.draftForm.patchValue({
    entryType: account.accountGroupName,
    accountGroupId: account.accountGroupId,
    destinationAccountName: account.accountName
  });
}
patchExpense(expenseData: any) {
  // Patch main form
  this.draftForm.patchValue({
    ...expenseData,
    paymentType: PaymentType[expenseData.paymentType as keyof typeof PaymentType],
    transactionStatus: expenseData.status,
    voucherDate: this.dateUtcPipe.transform(expenseData.voucherDate, 'input')
  });

  // Patch cash notes form (only if payment type is Cash or data exists)
  if (expenseData.paymentType === 'Cash') {
    this.cashNotesForm.patchValue({
      notes2000: expenseData.notes2000 || 0,
      notes1000: expenseData.notes1000 || 0,
      notes500: expenseData.notes500 || 0,
      notes200: expenseData.notes200 || 0,
      notes100: expenseData.notes100 || 0,
      notes50: expenseData.notes50 || 0,
      notes20: expenseData.notes20 || 0,
      notes10: expenseData.notes10 || 0,
      notes5: expenseData.notes5 || 0,
      coins: expenseData.coins || 0
    });
  }
}
private alwaysDisabledFields: string[] = [
  'voucherNumber',
  'sourceAccountCode',
  'sourceAccountId',
  'entryType',  
  'approvedBy',
  'approvedDate',
  'approvedByName',
  'paidBy',
  'paidByName',
  'createdByName'
];

private editableDraftFields: string[] = [
  'voucherDate',  
  'accountGroupId',
  'amount',
  'narration'  
];

  toggleFormsBasedOnTransactionStatus() {
  if (this.isAmountApproved && this.draftForm.get('transactionStatus')?.value === 'Approved') {
    this.draftForm.disable();        // disable left side
    this.cashNotesForm.enable();      // enable right side
  } 
  if (this.draftForm.get('transactionStatus')?.value === 'Draft') {
    Object.keys(this.draftForm.controls).forEach(key => {
    if (this.alwaysDisabledFields.includes(key)) {
      this.draftForm.get(key)?.disable();    
    } else {
      this.draftForm.get(key)?.enable();
    }
  });
  }
  if (this.draftForm.get('transactionStatus')?.value === 'Approved' && this.isAmountApproved && this.draftForm.get('paymentType')?.value === PaymentType.Bank) {
    this.cashNotesForm.disable(); // disable right side for bank payments
  }
}

  getAccountsByCompanyId(companyId: any) {
    this.masterService.getAccountsByCompanyId(companyId).subscribe((res: any[]) => {
      this.accounts = res;      
      const cashInHand = this.accounts.find(a => a.accountCode === 'CIH');
      if (cashInHand) {
        this.draftForm.patchValue({
          destinationAccountId: cashInHand.id,
          destinationAccountName: cashInHand.accountName,
          entryType: cashInHand.accountGroupCode + ' - ' + cashInHand.accountGroupName,
          accountGroupId: cashInHand.accountGroupId   
        });
      }

      if (!this.isUpdateMode) {
        const expenseAccount = this.accounts.find(a => a.accountCode === 'SLS');
        if (expenseAccount) {
          this.draftForm.patchValue({
            sourceAccountId: expenseAccount.id,
            sourceAccountCode: expenseAccount.accountCode,
            sourceAccountName: expenseAccount.accountName
          });
        }
      } else {
        const currentSourceId = this.draftForm.get('sourceAccountId')?.value;
        const sourceAcc = this.accounts.find(a => a.id === currentSourceId);
        if (sourceAcc) {
          this.draftForm.patchValue({ sourceAccountName: sourceAcc.accountName });
        }
      }
    });
  }
get isAmountApproved(): boolean {
  const approvedBy = this.draftForm.get('approvedBy')?.value;
  const approvedDate = this.draftForm.get('approvedDate')?.value;

  return !!approvedBy && !!approvedDate;
}
get isDraft(): boolean {
  return this.draftForm.get('transactionStatus')?.value?.toLowerCase() === 'draft';
}

get isPaid(): boolean {
  return this.draftForm.get('transactionStatus')?.value?.toLowerCase() === 'paid';
}

onPaymentTypeChange(selectedValue: any) {
  // Convert string to number if using numeric enum
  const numericValue = Number(selectedValue);  
  this.isCashMode = numericValue === PaymentType.Cash;

  if (this.isCashMode) {
    this.enableCashSection();
  } else {
    this.setNotesToZero();
    this.disableCashSection();
  }
}
disableCashSection() {
  const controls = [
    'notes2000','notes1000','notes500','notes200',
    'notes100','notes50','notes20','notes10','notes5','coins'
  ];

  controls.forEach(ctrl => {
    this.draftForm.get(ctrl)?.disable();
  });
}

enableCashSection() {
  const controls = [
    'notes2000','notes1000','notes500','notes200',
    'notes100','notes50','notes20','notes10','notes5','coins'
  ];

  controls.forEach(ctrl => {
    this.draftForm.get(ctrl)?.enable();
  });
}

  getNotesCountTotal(): number {
    const val = this.cashNotesForm.value;
    return (
      (val.notes2000 || 0) +
      (val.notes1000 || 0) +
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

  getNotesTotal(): number {
    const val = this.cashNotesForm.value;
    return (
      (val.notes2000 || 0) * 2000 +
      (val.notes1000 || 0) * 1000 +
      (val.notes500 || 0) * 500 +
      (val.notes200 || 0) * 200 +
      (val.notes100 || 0) * 100 +
      (val.notes50 || 0) * 50 +
      (val.notes20 || 0) * 20 +
      (val.notes10 || 0) * 10 +
      (val.notes5 || 0) * 5 +
      (val.coins || 0)
    );
  }
  
  setNotesToZero() {
  const controls = [
    'notes2000','notes1000','notes500','notes200',
    'notes100','notes50','notes20','notes10','notes5','coins'
  ];

  controls.forEach(controlName => {
  this.cashNotesForm.get(controlName)?.setValue(0);
});
}

  isAmountMismatch(): boolean {
  const paymentMode = Number(this.draftForm.get('paymentMode')?.value);

  // Ignore mismatch for Bank
  if (paymentMode === PaymentType.Bank) {
    return false;
  }

  const amount = this.draftForm.get('amount')?.value || 0;
  const notesTotal = this.getNotesTotal();

  return amount !== notesTotal;
}

isInvalid(controlName: string): boolean {
    const control = this.draftForm.get(controlName);
    return !!(control && control.touched && control.invalid);
}

  focusNext(next: HTMLElement) {
    next.focus();
  }

  onSubmitExpense() {    
    if (!this.draftForm.valid) {
      this.toastService.error('Please fill all required fields correctly');
      return;
    }

    this.draftForm.patchValue({
      companyId: this.companyId,
      voucherDate: this.dateUtcPipe.transform(this.draftForm.get('voucherDate')?.value, 'withCurrentTime'),   
      voucherType: VoucherType.DEP,
      paymentType: PaymentType.Cash
    });

    const expenseData = this.draftForm.getRawValue();

    if (this.expenseId) {
      this.updateExpense(expenseData);
    } else {
      this.createExpense(expenseData);
    }
  }
  onSaveDraft() {
    this.onSubmitExpense();
  }
  private createExpense(data: any) {
    data.amountApprovedBy = null; // Ensure approval is null for new expenses
    this.financeService.createVoucherTransaction(data).subscribe({
      next: res => {
        this.toastService.success(res?.message || 'Voucher transaction created successfully');
        this.router.navigate(['finance/bank-deposits']);
      },
      error: err => this.toastService.error(err?.error?.message || 'Error creating voucher transaction')
    });
  }

  private updateExpense(data: any) {
    data.approvedDate = this.draftForm.get('approvedDate')?.value || null;
    data.approvedBy = this.draftForm.get('approvedBy')?.value || null; 
    this.financeService.updateVoucherTransaction(this.expenseId, data).subscribe({
      next: res => {
        this.toastService.success(res?.message || 'Voucher transaction updated successfully');
        this.router.navigate(['finance/bank-deposits']);
      },
      error: err => this.toastService.error(err?.error?.message || 'Error updating voucher transaction')
    });
  }
  // Set null/empty note counts to 0 before calculation
  handleCashSection() {
    const controls = [
      'notes2000',
      'notes1000',
      'notes500',
      'notes200',
      'notes100',
      'notes50',
      'notes20',
      'notes10',
      'notes5',
      'coins'
    ];

    controls.forEach(ctrl => {
      const control = this.cashNotesForm.get(ctrl);

      if (control?.value == null || control.value === '') {
        control?.setValue(0);
      }
    });
  }
  onPayAmount() {
  if (this.isAmountMismatch()) {
    this.toastService.error("Notes total must match Amount");
    return;
  }

  if (!this.cashNotesForm.valid) {
    this.toastService.error('Please fill cash notes correctly');
    return;
  }

  // Set null/empty note counts to 0 before calculation
  this.handleCashSection();

  var payload = this.cashNotesForm.getRawValue();
  payload.voucherId = this.expenseId;
  payload.companyId = this.companyId;
  payload.voucherType = VoucherType.DEP;
  payload.paymentType = PaymentType.Cash; 

  this.financeService.payVoucherTransaction(payload).subscribe({
    next: res => {
      this.toastService.success(res?.message || 'Payment successful');
      this.router.navigate(['finance/bank-deposits']);
    },
    error: err =>
      this.toastService.error(err?.error?.message || 'Error processing payment')
  });
}
}
