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
import { EmployeeAdvanceType, PaymentType, TransactionStatus, VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-employee-advance',
  standalone: true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './employee-advance.component.html',
  styleUrl: './employee-advance.component.scss'
})
export class EmployeeAdvanceComponent {
  companyId: any;
  accounts: any[] = [];  
  sourceAccounts: any[] = [];
  destinationAccounts: any[] = [];  
  employees: any[] = []; 
  selectedEmployeeIndex: number = -1;

  bankAccounts: any[] = []; 
  cashAccount: any = null;  
  
   // Expose the enum to the template
  PaymentType = PaymentType;  // <-- THIS IS CRUCIAL
  VoucherType = EmployeeAdvanceType.EADV;  // <-- THIS IS CRUCIAL
  TransactionStatus = TransactionStatus;  // <-- THIS IS CRUCIAL

  draftForm = new FormGroup({
  id: new FormControl(0),
  companyId: new FormControl(''),

  voucherDate: new FormControl('', Validators.required),
  voucherNumber: new FormControl({ value: 0, disabled: true }),
  entryType : new FormControl({ value: 'ADVANCES', disabled: true }),
  paymentType: new FormControl(PaymentType.Cash, Validators.required),

  // Destination Account
  employeeId: new FormControl(''),
  employeeFullName: new FormControl(''),      
  monthlySalary: new FormControl(0),

  // Source Account
  sourceAccountId: new FormControl({ value: '', disabled: true }, Validators.required),
  bankAccountSelection : new FormControl(''),
  sourceAccountCode: new FormControl({ value: '', disabled: true }),
  sourceAccountName: new FormControl({ value: '', disabled: true }), 
  
  bankAccountId: new FormControl(''),
  
  advanceAmount: new FormControl(0, [Validators.required, Validators.min(0.01)]),
  narration: new FormControl(''),
  transactionNo: new FormControl(''), 
  
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

  voucherType: new FormControl(VoucherType.EADV), // Default to EADV
});

cashNotesForm = new FormGroup({ 
  id: new FormControl(0), // or transactionId
  voucherId: new FormControl(0),
  companyId: new FormControl(0),
  voucherType: new FormControl(EmployeeAdvanceType.EADV),
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
  coins: new FormControl<number | null>(null)
});

  isUpdateMode: boolean = false;
  employeeAdvanceId: any;
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
  
  this.employeeAdvanceId = this.route.snapshot.paramMap.get('id');
  if (this.employeeAdvanceId) {
    this.isUpdateMode = true;
    this.draftForm.get('paymentType')?.disable();
  }    
  this.getAccountsByCompanyId(this.companyId);  
  }

getAccountsByCompanyId(companyId: any): void {
  this.masterService.getAccountsByCompanyId(companyId)
    .subscribe({
      next: (res: any[]) => {
        this.accounts = res || [];

        // Cash in Hand
        this.cashAccount = this.accounts.find(
          acc => acc.accountCode === 'CIH'
        );

        // Source Accounts
        this.sourceAccounts = this.accounts.filter(
          acc =>
            acc.accountCode === 'CIH' ||
            acc.accountGroupCode === 'BNK'
        );

        // ALL Bank Accounts under Bank Account Group
        this.bankAccounts = this.accounts.filter(
          acc => acc.accountGroupCode === 'BNK'
        );

        // Destination Accounts
        this.destinationAccounts = this.accounts.filter(
          acc =>
            acc.accountCode !== 'CIH' &&
            acc.accountGroupCode !== 'BNK'
        );

        if (this.cashAccount) {
          this.setCashSourceAccount();
        }

        if (this.employeeAdvanceId) {
          this.getEmployeeAdvanceById(this.employeeAdvanceId);
        } else {
          this.setCashSourceAccount();
          this.onPaymentTypeChange(
            this.draftForm.get('paymentType')?.value
          );
        }

        this.onPaymentTypeChange(
          this.draftForm.get('paymentType')?.value
        );
      },

      error: err => {
        this.toastService.error(
          err?.error?.message || 'Error loading accounts'
        );
      }
    });
}
getEmployeeAdvanceById(id: any) {
  const employeeAdvancePayload = {id: id, companyId: this.companyId, voucherType: VoucherType.EADV};

  this.financeService.getEmployeeAdvanceById(employeeAdvancePayload).subscribe({
    next: (employeeAdvanceData: any) => {            
      const sourceAccountId = Number(employeeAdvanceData.sourceAccountId);
      // Find bank account from loaded accounts
      const selectedBank = this.bankAccounts.find(
        x => Number(x.id) === sourceAccountId
      );
      this.currentStatus = TransactionStatus[employeeAdvanceData.status as keyof typeof TransactionStatus];
      this.draftForm.patchValue({
        voucherNumber: employeeAdvanceData.voucherNumber,
        voucherDate: this.dateUtcPipe.transform(employeeAdvanceData.voucherDate,'input'),
        sourceAccountId: employeeAdvanceData.sourceAccountId,
        sourceAccountCode: employeeAdvanceData.sourceAccountCode,
        sourceAccountName: employeeAdvanceData.sourceAccountName,

        // IMPORTANT
        bankAccountSelection: String(employeeAdvanceData.sourceAccountId),

        bankName: selectedBank?.accountName || employeeAdvanceData.bankName ||'',
        employeeId: employeeAdvanceData.employeeId,
        employeeFullName: employeeAdvanceData.employeeFullName,        

        advanceAmount: employeeAdvanceData.advanceAmount,
        narration: employeeAdvanceData.narration,
        transactionNo: employeeAdvanceData.transactionNo,

        paymentType: PaymentType[employeeAdvanceData.paymentType as keyof typeof PaymentType],

        chequeNumber: employeeAdvanceData.chequeNumber,
        remark: employeeAdvanceData.remark,

        transactionStatus: employeeAdvanceData.status,

        createdByName: employeeAdvanceData.createdByName,
        approvedByName: employeeAdvanceData.approvedByName
      });

      this.cashNotesForm.patchValue({
        notes2000: employeeAdvanceData.notes2000,
        notes1000: employeeAdvanceData.notes1000,
        notes500: employeeAdvanceData.notes500,
        notes200: employeeAdvanceData.notes200,
        notes100: employeeAdvanceData.notes100,
        notes50: employeeAdvanceData.notes50,
        notes20: employeeAdvanceData.notes20,
        notes10: employeeAdvanceData.notes10,
        notes5: employeeAdvanceData.notes5,
        coins: employeeAdvanceData.coins
      });
      this.isCashMode = PaymentType[employeeAdvanceData.paymentType as keyof typeof PaymentType] === PaymentType.Cash;
      this.applyStatusRules();

      this.cd.detectChanges();
    },

    error: (error: any) => {
      this.toastService.error(
        error?.error?.message ||
        'Error fetching employee advance details'
      );
    }
  });
}

private setCashSourceAccount(): void {
  if (!this.cashAccount) {
    return;
  }

  this.draftForm.patchValue({
    sourceAccountId: this.cashAccount.id,
    sourceAccountCode: this.cashAccount.accountCode,
    sourceAccountName: this.cashAccount.accountName,
    bankName: ''
  });
}
private setBankSourceAccount(): void {

  // First check whether user already selected a bank account
  const selectedBankAccountId = this.draftForm.get('bankAccountId')?.value;

  let account = this.bankAccounts.find(
    acc => Number(acc.id) === Number(selectedBankAccountId)
  );

  // If no bank is selected, automatically select default bank
  if (!account) {
    account = this.getDefaultBankAccount();
  }

  if (!account) {
    // No bank account configured
    this.draftForm.patchValue({
      bankAccountId: '',
      sourceAccountId: '',
      sourceAccountCode: '',
      sourceAccountName: '',
      bankName: ''
    });

    return;
  }

  // Set selected/default bank account
  this.draftForm.patchValue({
    bankAccountId: account.id,

    // Bank becomes source account
    sourceAccountId: account.id,
    sourceAccountCode: account.accountCode,
    sourceAccountName: account.accountName,

    bankName: account.accountName
  });

  // Source account must remain readonly/disabled
  this.disableSourceAccount();
}
private getDefaultBankAccount(): any {
    return this.bankAccounts.find(
      acc => acc.isDefault === true
    ) || this.bankAccounts[0] || null;
  }
onBankAccountChange(accountId?: any): void {
  const selectedId = accountId ?? this.draftForm.get('bankAccountSelection')?.value;

  let selectedAccount = this.bankAccounts.find(
    acc => Number(acc.id) === Number(selectedId));

  // If nothing is selected, automatically use default bank
  if (!selectedAccount) {
    selectedAccount = this.getDefaultBankAccount();
  }

  if (!selectedAccount) {
    return;
  }

  this.draftForm.patchValue({
    bankAccountSelection: selectedAccount.id,

    // Bank account becomes source account
    sourceAccountId: selectedAccount.id,
    sourceAccountCode: selectedAccount.accountCode,
    sourceAccountName: selectedAccount.accountName,

    bankName: selectedAccount.accountName
  });

  // Source account must remain disabled
  this.disableSourceAccount();
}

private applyStatusRules(): void {

  const paymentType = Number(this.draftForm.get('paymentType')?.value);
  switch (this.currentStatus) {
    case TransactionStatus.Draft:
      this.draftForm.enable();
      this.disableAlwaysDisabledFields();
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
  // Always disabled
  this.disableSourceAccount();
}

private alwaysDisabledFields: string[] = [
  'voucherNumber',
  'entryType',
  'sourceAccountId',
  'sourceAccountCode',
  'sourceAccountName',
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
  'advanceAmount',
  'narration',
  'transactionNo',    
  'chequeNumber',
  'remark'
];
private setSourceAccount(accountCode: string): void {
  const account = this.accounts.find(x => x.accountCode === accountCode);

  if (!account) {
    return;
  }

  this.draftForm.patchValue({
    sourceAccountId: account.id,
    sourceAccountCode: account.accountCode,
    sourceAccountName: account.accountName
  });

  if (accountCode === 'BNK') {
    this.draftForm.patchValue({
      bankName: account.accountName
    });
  } else {
    this.draftForm.patchValue({
      bankName: ''
    });
  }
}
onPaymentTypeChange(selectedValue: any): void {

  const paymentType = Number(selectedValue);

  this.isCashMode = paymentType === PaymentType.Cash;

  const chequeNumberControl =
    this.draftForm.get('chequeNumber');

  if (paymentType === PaymentType.Bank) {

    chequeNumberControl?.setValidators([
      Validators.required
    ]);
    chequeNumberControl?.updateValueAndValidity();

    // Automatically select default bank
    this.onBankAccountChange();

    // Bank does not use cash notes
    this.cashNotesForm.disable();

  } else if (paymentType === PaymentType.Cash) {

    chequeNumberControl?.clearValidators();
    chequeNumberControl?.updateValueAndValidity();

    // Cash = Cash In Hand
    this.setCashSourceAccount();

    this.draftForm.patchValue({
      bankAccountSelection: '',
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

  this.disableSourceAccount();
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

isAmountMismatch(): boolean {
  const paymentType = Number(this.draftForm.get('paymentType')?.value);

  // Bank payment does not require cash-note matching
  if (paymentType === PaymentType.Bank) {
    return false;
  }

  const amount = Number(this.draftForm.get('advanceAmount')?.value ?? 0);
  const notesTotal = Number(this.getNotesTotal());

  return amount !== notesTotal;
}

searchEmployee(event: any): void {
  const keyword = event.target.value.trim();

  // Reset selected index
  this.selectedEmployeeIndex = -1;

  // Clear employee ID while user is typing
  this.draftForm.patchValue({
    employeeId: ''
  });

  // Don't search for less than 2 characters
  if (!keyword || keyword.length < 2) {
    this.employees = [];
    return;
  }

  this.employeesService
    .searchEmployees(keyword, this.companyId)
    .subscribe(
      (response: any) => {
        this.employees = response || [];
        this.selectedEmployeeIndex = -1;
      },
      (error: any) => {
        this.employees = [];

        this.toastService.error(
          error.error?.message || 'Error fetching employees'
        );
      }
    );
}
onEmployeeKeydown(event: KeyboardEvent): void {
  // No suggestions
  if (!this.employees || this.employees.length === 0) {
    return;
  }

  // Arrow Down
  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (this.selectedEmployeeIndex < this.employees.length - 1) {
      this.selectedEmployeeIndex++;
    } else {
      this.selectedEmployeeIndex = 0;
    }
  }

  // Arrow Up
  else if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (this.selectedEmployeeIndex > 0) {
      this.selectedEmployeeIndex--;
    } else {
      this.selectedEmployeeIndex = this.employees.length - 1;
    }
  }

  // Enter
  else if (event.key === 'Enter') {
    event.preventDefault();
    if (
      this.selectedEmployeeIndex >= 0 &&
      this.selectedEmployeeIndex < this.employees.length
    ) {
      const employee = this.employees[this.selectedEmployeeIndex];

      this.selectEmployee(employee);
    }
  }

  // Escape
  else if (event.key === 'Escape') {
    event.preventDefault();

    this.employees = [];
    this.selectedEmployeeIndex = -1;
  }
}
selectEmployee(employee: any): void {
  this.draftForm.patchValue({
    employeeId: employee.employeeId,
    employeeFullName: employee.employeeFullName
  });

  // Close dropdown
  this.employees = [];

  // Reset keyboard selection
  this.selectedEmployeeIndex = -1;
}


isInvalid(controlName: string): boolean {
  const control = this.draftForm.get(controlName);
  return !!(control && control.touched && control.invalid);
}

focusNext(next: HTMLElement) {
  next.focus();
}
onSubmitEmployeeAdvance() {   
  
  const advanceAmount = Number(this.draftForm.get('advanceAmount')?.value);

  // Amount must be greater than zero
  if (advanceAmount <= 0) {
    this.draftForm.get('advanceAmount')?.markAsTouched();
    this.toastService.error('Advance Amount must be greater than 0');
    return;
  }

  // Validate entire form
  if (!this.draftForm.valid) {
    this.toastService.error('Please fill all required fields correctly');
    return;
  }

  this.draftForm.patchValue({
    companyId: this.companyId,
    voucherDate: this.dateUtcPipe.transform(this.draftForm.get('voucherDate')?.value, 'withCurrentTime'),
    paymentType: Number(this.draftForm.get('paymentType')?.value),
    voucherType: VoucherType.EADV
  });

  const employeeAdvanceData = this.draftForm.getRawValue();

  if (this.employeeAdvanceId) {
    this.updateEmployeeAdvance(employeeAdvanceData);
  } else {
    this.createEmployeeAdvance(employeeAdvanceData);
  }
}
onSaveDraft() {
  this.onSubmitEmployeeAdvance();
}
private createEmployeeAdvance(data: any) {
  data.amountApprovedBy = null; // Ensure approval is null for new employee advance
  this.financeService.createEmployeeAdvance(data).subscribe({
    next: res => {
      this.toastService.success(res?.message || 'employee advance created successfully');
      this.router.navigate(['finance/employee-advances']);
    },
    error: err => this.toastService.error(err?.error?.message || 'Error creating employee advance')
  });
}

private updateEmployeeAdvance(data: any) {
  data.approvedDate = this.draftForm.get('approvedDate')?.value || null;
  data.approvedBy = this.draftForm.get('approvedBy')?.value || null; 
  this.financeService.updateEmployeeAdvance(this.employeeAdvanceId, data).subscribe({
    next: res => {
      this.toastService.success(res?.message || 'Employee advance updated successfully');
      this.router.navigate(['finance/employee-advances']);
    },
    error: err => this.toastService.error(err?.error?.message || 'Error updating voucher transaction')
  });
}

private prepareEmployeeAdvanceData(): any {
  const employeeAdvanceData = this.draftForm.getRawValue();
  const cashData = this.cashNotesForm.getRawValue();

  return {
    ...employeeAdvanceData,

    companyId: this.companyId,
    paymentType: Number(employeeAdvanceData.paymentType),
    voucherType: EmployeeAdvanceType.EADV,

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

  // Only Cash requires notes
  if (paymentType === PaymentType.Cash) {    
    if (this.isAmountMismatch()) {
      this.toastService.error('Notes total must match Advance Amount');
      return;
    }

    if (!this.cashNotesForm.valid) {
      this.toastService.error('Please fill cash notes correctly');
      return;
    }
  }

  
  const employeeAdvanceData = this.prepareEmployeeAdvanceData();
  employeeAdvanceData.id = this.employeeAdvanceId;
  employeeAdvanceData.companyId = this.companyId;
  employeeAdvanceData.voucherType = EmployeeAdvanceType.EADV;
  employeeAdvanceData.paymentType = paymentType;
  this.financeService.payEmployeeAdvance(employeeAdvanceData).subscribe({
    next: (res: any) => {
      this.toastService.success(res?.message || 'Payment successful');
      this.router.navigate(['finance/employee-advances']);
    },
    error: (err: any) => {
      this.toastService.error(
        err?.error?.message || err?.error || 'Error processing payment');
    }
  });
}
  
}
