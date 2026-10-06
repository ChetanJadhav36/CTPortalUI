import { ChangeDetectorRef, Component } from '@angular/core';
import { BankDepositType, PaymentType, TransactionStatus, VoucherType } from '../../../enums/permission.enum';
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

  amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
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

  voucherType: new FormControl(BankDepositType.BDEP), // Default to BDEP
  paymentType: new FormControl(PaymentType.Cash),
});

cashNotesForm = new FormGroup({ 
  id: new FormControl(0), // or transactionId
  voucherId: new FormControl(0),
  companyId: new FormControl(0),
  voucherType: new FormControl(BankDepositType.BDEP),
  paymentType: new FormControl(PaymentType.Cash),

  // Cash
  notes2000: new FormControl<number | null>(null),
  notes1000: new FormControl<number | null>(null),
  notes500: new FormControl<number | null>(null),
  notes200: new FormControl<number | null>(null),
  notes100: new FormControl<number | null>(null),
  notes50: new FormControl<number | null>(null),
  notes20: new FormControl<number | null>(null),
  notes10: new FormControl<number | null>(null),
  notes5: new FormControl<number | null>(null),
  coins: new FormControl<number | null>(null),
});

  isUpdateMode: boolean = false;
  id: any;
  isCashMode: boolean = false;
  currentStatus: TransactionStatus = TransactionStatus.Draft;
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

    this.id = this.route.snapshot.paramMap.get('id');
    this.isUpdateMode = !!this.id;

    // SEQUENTIAL FLOW
    this.masterService.getAccountsByCompanyId(this.companyId).pipe(
      tap((accounts: any[]) => {
        this.accounts = accounts;
        this.bankAccounts = accounts.filter(
          a =>
            a.accountGroupCode === 'BNK'
        );
        this.setDefaultAccounts();
      }),
      switchMap(() => {
        if (this.isUpdateMode) {
          return this.financeService.getBankDepositById({id: this.id, companyId: this.companyId, voucherType: BankDepositType.BDEP});
        }
        return of(null);
      })
    ).subscribe({
      next: (expenseData: any) => {
        if (expenseData) {     
          this.currentStatus = TransactionStatus[expenseData.status as keyof typeof TransactionStatus];          
          this.patchExpense(expenseData);
        }

        // Run AFTER everything is ready        
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
        notes2000: expenseData.notes2000,
        notes1000: expenseData.notes1000,
        notes500: expenseData.notes500,
        notes200: expenseData.notes200,
        notes100: expenseData.notes100,
        notes50: expenseData.notes50,
        notes20: expenseData.notes20,
        notes10: expenseData.notes10,
        notes5: expenseData.notes5,
        coins: expenseData.coins
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
    if (this.isAmountApproved && (this.draftForm.get('transactionStatus')?.value === 'Approved')) {
      this.draftForm.disable();        // disable left side
      this.cashNotesForm.enable();      // enable right side
    } 
    else if (this.draftForm.get('transactionStatus')?.value === 'Paid') {
      this.draftForm.disable();
      this.cashNotesForm.disable();
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
  const val = this.cashNotesForm.getRawValue();

  return (
    Number(val.notes2000 ?? 0) +
    Number(val.notes1000 ?? 0) +
    Number(val.notes500 ?? 0) +
    Number(val.notes200 ?? 0) +
    Number(val.notes100 ?? 0) +
    Number(val.notes50 ?? 0) +
    Number(val.notes20 ?? 0) +
    Number(val.notes10 ?? 0) +
    Number(val.notes5 ?? 0) +
    Number(val.coins ?? 0)
  );
  }

  getNotesTotal(): number {
  const val = this.cashNotesForm.getRawValue();

  return (
    Number(val.notes2000 ?? 0) * 2000 +
    Number(val.notes1000 ?? 0) * 1000 +
    Number(val.notes500 ?? 0) * 500 +
    Number(val.notes200 ?? 0) * 200 +
    Number(val.notes100 ?? 0) * 100 +
    Number(val.notes50 ?? 0) * 50 +
    Number(val.notes20 ?? 0) * 20 +
    Number(val.notes10 ?? 0) * 10 +
    Number(val.notes5 ?? 0) * 5 +
    Number(val.coins ?? 0)
  );
  }

  isAmountMismatch(): boolean {
  const paymentType = Number(this.draftForm.get('paymentType')?.value);

  // Ignore mismatch for Bank
  if (paymentType === PaymentType.Bank) {
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

  onSubmitBankDeposit() {   
    const amount = Number(this.draftForm.get('amount')?.value);

  // Amount must be greater than 0
  if (amount <= 0 || !Number.isFinite(amount)) {
    this.draftForm.get('amount')?.markAsTouched();
    this.toastService.error('Amount must be greater than 0');
    return;
  } 
    if (!this.draftForm.valid) {
      this.toastService.error('Please fill all required fields correctly');
      return;
    }

    this.draftForm.patchValue({
      companyId: this.companyId,
      voucherDate: this.dateUtcPipe.transform(this.draftForm.get('voucherDate')?.value, 'withCurrentTime'),   
      voucherType: BankDepositType.BDEP,  // Ensure voucherType is set to BDEP
      paymentType: PaymentType.Cash
    });

    const bankDepositData = this.draftForm.getRawValue();

    if (this.id) {
      this.updateBankDeposit(bankDepositData);
    } else {
      this.createBankDeposit(bankDepositData);
    }
  }

  onSaveDraft() {
  this.onSubmitBankDeposit();
  }

  private createBankDeposit(data: any) {
      data.amountApprovedBy = null; // Ensure approval is null for new expenses
      this.financeService.createBankDeposit(data).subscribe({
        next: res => {
          this.toastService.success(res?.message || 'bank deposit created successfully');
          this.router.navigate(['finance/bank-deposits']);
        },
        error: err => this.toastService.error(err?.error?.message || 'Error creating bank deposit')
      });
  }

  private updateBankDeposit(data: any) {
    data.approvedDate = this.draftForm.get('approvedDate')?.value || null;
    data.approvedBy = this.draftForm.get('approvedBy')?.value || null; 
    this.financeService.updateBankDeposit(this.id, data).subscribe({
      next: res => {
        this.toastService.success(res?.message || 'Voucher transaction updated successfully');
        this.router.navigate(['finance/bank-deposits']);
      },
      error: err => this.toastService.error(err?.error?.message || 'Error updating voucher transaction')
    });
  }  

  private prepareBankDepositData(): any {
    const bankDepositData = this.draftForm.getRawValue();
    const cashData = this.cashNotesForm.getRawValue();
  
    return {
      ...bankDepositData,
  
      companyId: this.companyId,
      paymentType: Number(bankDepositData.paymentType),
      voucherType: BankDepositType.BDEP,
  
      notes2000: cashData.notes2000 ?? 0,
      notes1000: cashData.notes1000 ?? 0,
      notes500: cashData.notes500 ?? 0,
      notes200: cashData.notes200 ?? 0,
      notes100: cashData.notes100 ?? 0,
      notes50: cashData.notes50 ?? 0,
      notes20: cashData.notes20 ?? 0,
      notes10: cashData.notes10 ?? 0,
      notes5: cashData.notes5 ?? 0,
      coins: cashData.coins ?? 0
    };
  }

  onPayAmount() {
  const amount = Number(this.draftForm.get('amount')?.value);

  if (amount <= 0 || !Number.isFinite(amount)) {
    this.toastService.error('Amount must be greater than 0');
    return;
  }

  if (this.isAmountMismatch()) {
    this.toastService.error('Notes total must match Amount');
    return;
  }

  if (!this.cashNotesForm.valid) {
    this.toastService.error('Please fill cash notes correctly');
    return;
  }

  const bankDepositData = this.prepareBankDepositData();

  this.financeService.markBankDepositAsPaid(bankDepositData).subscribe({
    next: res => {
      this.toastService.success(res?.message || 'Payment successful');
      this.router.navigate(['finance/bank-deposits']);
    },
    error: err =>
      this.toastService.error(err?.error?.message || 'Error processing payment')
  });
}
  
}
