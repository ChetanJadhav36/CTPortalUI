import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { FinanceService } from '../../../services/finance.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { CommonModule } from '@angular/common';
import { EmployeesService } from '../../../services/employees.service';
import { ExpenseType, PaymentType, TransactionStatus, VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-expense',
  standalone: true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss'
})
export class ExpenseComponent {
  companyId: any;
  accounts: any[] = [];  
  sourceAccounts: any[] = [];
  destinationAccounts: any[] = [];  
  employees: any[] = []; 
  bankAccounts: any[] = [];
  
  // Expose the enum to the template
  PaymentType = PaymentType;  // <-- THIS IS CRUCIAL
  VoucherType = ExpenseType;  // <-- THIS IS CRUCIAL
  TransactionStatus = TransactionStatus;  // <-- THIS IS CRUCIAL

  draftForm = new FormGroup({
  id: new FormControl(0),
  companyId: new FormControl(''),

  voucherDate: new FormControl('', Validators.required),
  voucherNumber: new FormControl({ value: 0, disabled: true }),
  paymentType: new FormControl(PaymentType.Cash, Validators.required),

  sourceAccountId: new FormControl({ value: '', disabled: true }, Validators.required),
  sourceAccountCode: new FormControl({ value: '', disabled: true }),
  sourceAccountName: new FormControl({ value: '', disabled: true }),

  destinationAccountId: new FormControl('', Validators.required),  
  destinationAccountCode: new FormControl(''),
  destinationAccountName: new FormControl(''),

  bankAccountId: new FormControl(''),
  
  accountGroupId: new FormControl('', Validators.required),
  accountGroupName: new FormControl({ value: '', disabled: true }),

  amount: new FormControl(0, [Validators.required, Validators.min(0.01)]),
  narration: new FormControl(''),
  transactionNo: new FormControl(''),

  vehicleId: new FormControl(),
  vehicleNumber: new FormControl(''),  
  
  approvedBy: new FormControl({ value: null, disabled: true }),
  approvedDate: new FormControl({ value: null, disabled: true }),
  approvedByName: new FormControl({ value: '', disabled: true }),
  
  paidBy: new FormControl({ value: null, disabled: true }),
  paidByName: new FormControl({ value: '', disabled: true }),

  // Bank
  bankName:new FormControl({ value: '', disabled: true }),
  chequeNumber: new FormControl(''),
  remark: new FormControl(''),

  createdByName: new FormControl({ value: '', disabled: true }),
  transactionStatus: new FormControl('Draft'), // Default to Draft

  voucherType: new FormControl(ExpenseType.EXP), // Default to EXP
});

cashNotesForm = new FormGroup({ 
  id: new FormControl(0), // or transactionId
  voucherNo: new FormControl(''),
  companyId: new FormControl(''),
  voucherType: new FormControl(ExpenseType.EXP),
  paymentType: new FormControl(PaymentType.Cash),

  // Cash
  notes2000: new FormControl<number | null>(null),
  notes1000: new FormControl<number | null>(null),
  notes500: new FormControl<number | null>(null),
  notes100: new FormControl<number | null>(null),
  notes200: new FormControl<number | null>(null),
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
    private employeesService: EmployeesService,
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
  this.draftForm.patchValue({
    voucherDate: this.dateUtcPipe.transform(new Date(), 'input')    
  });  

  this.id = this.route.snapshot.paramMap.get('id');
  if (this.id) {
    this.isUpdateMode = true;
    this.draftForm.get('paymentType')?.disable();
  }    
  this.getAccountsByCompanyId(this.companyId);  
  }

  getAccountsByCompanyId(companyId: any): void {
    this.masterService.getAccountsByCompanyId(companyId)
      .subscribe({
        next: (res: any[]) => {

          this.accounts = res;

          // Cash account
          const cashInHand = this.accounts.find(
            acc => acc.accountCode === 'CIH'
          );

          // ALL accounts belonging to BNK account group
          this.bankAccounts = this.accounts.filter(
            acc => acc.accountGroupCode === 'BNK'
          );

          // Expense source accounts:
          // Cash In Hand + individual BNK accounts
          this.sourceAccounts = this.accounts.filter(
            acc =>
              acc.accountCode === 'CIH' ||
              acc.accountGroupCode === 'BNK'
          );

          // Destination = accounts other than Cash/Bank
          this.destinationAccounts = this.accounts.filter(
            acc =>
              acc.accountCode !== 'CIH' &&
              acc.accountGroupCode !== 'BNK'
          );

          // Default source = Cash In Hand
          if (cashInHand) {
            this.draftForm.patchValue({
              sourceAccountId: cashInHand.id,
              sourceAccountCode: cashInHand.accountCode,
              sourceAccountName: cashInHand.accountName
            });
          }

          if (this.id) {
            // UPDATE
            // getExpenseById() will restore saved account/payment type
            this.getExpenseById(this.id);
          } else {
            // CREATE
            this.onPaymentTypeChange(
              this.draftForm.get('paymentType')?.value
            );
          }
        },

        error: err => {
          this.toastService.error(
            err?.error?.message ||
            'Error loading accounts'
          );
        }
      });
  }
  private setCashSourceAccount(): void {

    const account = this.accounts.find(
      acc => acc.accountCode === 'CIH'
    );

    if (!account) {
      return;
    }

    this.draftForm.patchValue({
      sourceAccountId: account.id,
      sourceAccountCode: account.accountCode,
      sourceAccountName: account.accountName,
      bankName: ''
    });
  }
  private setBankSourceAccount(): void {
    const bankAccountId = this.draftForm.get('bankAccountId')?.value;

    let account = this.bankAccounts.find(
      acc => Number(acc.id) === Number(bankAccountId)
    );

    // CREATE mode:
    // If no bank account is selected, use default BNK account.
    if (!account) {
      account = this.getDefaultBankAccount();
    }

    if (!account) {
      return;
    }

    this.draftForm.patchValue({
      bankAccountId: account.id,

      sourceAccountId: account.id,
      sourceAccountCode: account.accountCode,
      sourceAccountName: account.accountName,

      bankName: account.accountName
    });
  }
  private getDefaultBankAccount(): any {
    return this.bankAccounts.find(
      acc => acc.isDefault === true
    ) || this.bankAccounts[0] || null;
  }
  onBankAccountChange(): void {

    const accountId =
      this.draftForm.get('bankAccountId')?.value;

    const selectedAccount =
      this.bankAccounts.find(
        acc =>
          Number(acc.id) === Number(accountId)
      );

    if (!selectedAccount) {
      return;
    }

    this.draftForm.patchValue({

      // Bank account becomes source account
      sourceAccountId:
        selectedAccount.id,

      sourceAccountCode:
        selectedAccount.accountCode,

      sourceAccountName:
        selectedAccount.accountName,

      // Display bank name
      bankName:
        selectedAccount.accountName

    });

    // Source must remain disabled
    this.disableSourceAccount();
  }
  getExpenseById(id: any) {
  var expensePayload = { id: id, companyId: this.companyId, voucherType: ExpenseType.EXP };
    this.financeService.getExpenseById(expensePayload).subscribe(
      (expenseData: any) => {      
        this.currentStatus = TransactionStatus[expenseData.status as keyof typeof TransactionStatus];
        this.draftForm.patchValue({                    
            voucherDate: this.dateUtcPipe.transform(expenseData.voucherDate, 'input'),

            sourceAccountId:expenseData.sourceAccountId,          
            sourceAccountName: expenseData.sourceAccountName,          
            sourceAccountCode: expenseData.sourceAccountCode,

            accountGroupId: expenseData.accountGroupId,
            accountGroupName: expenseData.accountGroupName,

            destinationAccountId: expenseData.destinationAccountId,
            destinationAccountName: expenseData.destinationAccountName,
            bankAccountId: expenseData.sourceAccountId,
            
            amount: expenseData.amount,
            narration: expenseData.narration,
            transactionNo: expenseData.transactionNo,         
            paymentType: PaymentType[expenseData.paymentType as keyof typeof PaymentType],
            bankName: expenseData.bankName,
            chequeNumber: expenseData.chequeNumber,
            remark: expenseData.remark,
            transactionStatus: expenseData.status, // Assuming API returns status as string like 'Draft', 'Approved', etc.                            

            createdByName: expenseData.createdByName,
            approvedByName: expenseData.approvedByName          
        });      

        if (expenseData) {
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
            coins: expenseData.coins,
          })
        }      
        this.applyStatusRules();
        this.onPaymentTypeChange(this.draftForm.get('paymentType')?.value);
        this.cd.detectChanges(); // force refresh
        const selectedAccount = this.accounts.find(
      acc =>
        Number(acc.id) ===
        Number(expenseData.destinationAccountId)
      );

      if (selectedAccount) {
      this.draftForm.patchValue({
        accountGroupId: selectedAccount.accountGroupId
      });    
      }
      },
      (error: any) => {
        this.toastService.error(error?.error?.message || 'Error fetching expense details');
      }
    );
  }
  private applyStatusRules(): void {
    const paymentType =  Number(this.draftForm.get('paymentType')?.value);
    switch (this.currentStatus) {
      case TransactionStatus.Draft:
        // Draft => editable
        this.draftForm.enable();
        // These fields must always stay disabled
        this.disableAlwaysDisabledFields();
        // Cash notes depend on payment type
        if (paymentType === PaymentType.Cash) {
          this.cashNotesForm.enable();
        } else {
          this.cashNotesForm.disable();
        }
        break;
      case TransactionStatus.Approved:
        this.draftForm.disable();
        if (paymentType === PaymentType.Cash) {
          this.cashNotesForm.enable();
        } else {
          this.cashNotesForm.disable();
        }
        break;
      case TransactionStatus.Paid:
        this.draftForm.disable();
        this.cashNotesForm.disable();
        break;
    }

    // Always keep source account disabled
    this.disableSourceAccount();
  }
  onDestinationAccountChange(): void {
    const accountId = this.draftForm.get('destinationAccountId')?.value;
    const account = this.accounts.find(acc => Number(acc.id) === Number(accountId));
    if (!account) {
      return;
    }

    this.draftForm.patchValue({
      destinationAccountName: account.accountName,
      accountGroupId: account.accountGroupId,
      accountGroupName: account.accountGroupName
    }); 
  }
  private alwaysDisabledFields: string[] = [
    'voucherNumber',
    'sourceAccountId',
    'sourceAccountCode',
    'sourceAccountName',
    'accountGroupId',   
    'accountGroupName',
    'bankName' ,
    'approvedBy',
    'approvedDate',
    'approvedByName',
    'paidBy',
    'paidByName',
    'createdByName'
  ];
  private disableAlwaysDisabledFields(): void {
    this.alwaysDisabledFields.forEach(field => {
      this.draftForm.get(field)?.disable({ emitEvent: false });
    });
  }

  private editableDraftFields: string[] = [
    'voucherDate',
    'paymentType',  
    'amount',
    'narration',
    'transactionNo',    
    'chequeNumber',
    'remark'
  ];
  
  onPaymentTypeChange(selectedValue: any): void {
  const paymentType = Number(selectedValue);

  this.isCashMode = paymentType === PaymentType.Cash;

  const chequeNumberControl = this.draftForm.get('chequeNumber');

  if (paymentType === PaymentType.Bank) {

    // Cheque number is required for Bank payment
    chequeNumberControl?.setValidators([Validators.required]);
    chequeNumberControl?.updateValueAndValidity();

    // Bank => selected/default bank account
    this.setBankSourceAccount();

    // Bank payment does not use cash notes
    this.cashNotesForm.disable();

  } else if (paymentType === PaymentType.Cash) {

    // Cheque number is NOT required for Cash
    chequeNumberControl?.clearValidators();
    chequeNumberControl?.updateValueAndValidity();

    // Cash => Cash In Hand
    this.setCashSourceAccount();

    this.draftForm.patchValue({
      bankAccountId: '',
      bankName: '',
      chequeNumber: '',
      remark: ''
    });

    this.cashNotesForm.enable();

  } else {

    chequeNumberControl?.clearValidators();
    chequeNumberControl?.updateValueAndValidity();

    this.cashNotesForm.disable();
  }

  // Source account must ALWAYS remain disabled
  this.disableSourceAccount();

  // Existing status rules
  this.applyStatusRules();
  }
  
  private disableSourceAccount(): void {
    this.draftForm.get('sourceAccountId')?.disable({
      emitEvent: false
    });

    this.draftForm.get('sourceAccountCode')?.disable({
      emitEvent: false
    });

    this.draftForm.get('sourceAccountName')?.disable({
      emitEvent: false
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

  // Bank payment does not require cash-note matching
  if (paymentType === PaymentType.Bank) {
    return false;
  }

  const amount = Number(this.draftForm.get('amount')?.value ?? 0);
  const notesTotal = Number(this.getNotesTotal());
  return amount !== notesTotal;
}


  searchEmployee(event: any) {
    const keyword = event.target.value;
    if (keyword.length <= 1) {
      this.employees = [];
      return;
    }
    this.employeesService.searchEmployees(keyword, this.companyId)
      .subscribe(
      res => this.employees = res,
      err => this.toastService.error(err?.error?.message || 'Error fetching employees'));
  }

  isInvalid(controlName: string): boolean {
    const control = this.draftForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
  focusNext(next: HTMLElement) {
    next.focus();
  }

  onSubmitExpense() {    
    const amount = Number(this.draftForm.get('amount')?.value);

    if (amount <= 0) {
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
      paymentType: Number(this.draftForm.get('paymentType')?.value),
      voucherType: ExpenseType.EXP
    });    
    const expenseData = this.draftForm.getRawValue();
    if (this.id) {
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
    this.financeService.createExpense(data).subscribe({
      next: res => {
        this.toastService.success(res?.message || 'Voucher transaction created successfully');
        this.router.navigate(['finance/expenses']);
      },
      error: err => this.toastService.error(err?.error?.message || 'Error creating voucher transaction')
    });
  }

  private updateExpense(data: any) {
    data.approvedDate = this.draftForm.get('approvedDate')?.value || null;
    data.approvedBy = this.draftForm.get('approvedBy')?.value || null; 
    this.financeService.updateExpense(this.id, data).subscribe({
      next: res => {
        this.toastService.success(res?.message || 'Voucher transaction updated successfully');
        this.router.navigate(['finance/expenses']);
      },
      error: err => this.toastService.error(err?.error?.message || 'Error updating voucher transaction')
    });
  }

  private prepareExpenseData(): any {
  const expenseData = this.draftForm.getRawValue();
  const cashData = this.cashNotesForm.getRawValue();

  return {
    ...expenseData,

    companyId: this.companyId,
    paymentType: Number(expenseData.paymentType),
    voucherType: ExpenseType.EXP,

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

  onPayAmount(): void {
  const paymentType = Number(this.draftForm.get('paymentType')?.value);
  if (paymentType === PaymentType.Cash && this.isAmountMismatch()) {
      this.toastService.error('Notes total must match Amount');
      return;
  }

  if (paymentType === PaymentType.Cash && !this.cashNotesForm.valid) {
    this.toastService.error('Please fill cash notes correctly');
    return;
  }

  // Cashnotes adding while paying payment
  const expenseData = this.prepareExpenseData();

  expenseData.id = this.id;
  expenseData.companyId = this.companyId;
  expenseData.voucherType = ExpenseType.EXP;
  expenseData.paymentType = paymentType;

  this.financeService.payExpense(expenseData).subscribe({
    next: res => {
      this.toastService.success(res?.message || 'Payment successful');
      this.router.navigate(['finance/expenses']);
    },
    error: err => {
      this.toastService.error(err?.error?.message || 'Error processing payment');
    }
  });
  }
  
}
