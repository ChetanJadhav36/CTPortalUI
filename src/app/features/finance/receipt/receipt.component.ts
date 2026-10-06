import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { EmployeesService } from '../../../services/employees.service';
import { FinanceService } from '../../../services/finance.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { PaymentType, VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-receipt',
  standalone: true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss'
})
export class ReceiptComponent {
  companyId: any;
  accountGroups: any[] = [];
  accounts: any[] = [];
  sourceAccounts: any[] = [];
  cashInHandAccount: any;
  bankAccounts: any[] = [];  
  employees: any[] = [];
  selectedEmployeeIndex: number = -1;
  vehicles: any[] = [];
  selectedVehicleIndex: number = -1;
  PaymentType = PaymentType;
  // In your component
  amountPaidOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
];
  receiptForm = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(''),

    employeeId: new FormControl('', Validators.required),
    employeeFullName: new FormControl(''), 
    
    vehicleId: new FormControl(),
    vehicleNumber: new FormControl(''),

    voucherDate: new FormControl('', Validators.required),
    voucherNumber: new FormControl({ value: 0, disabled: true }), // Auto-generated
    paymentType: new FormControl<number | null>(null, Validators.required),

    destinationAccountId: new FormControl('', Validators.required),   // Received In
    destinationAccountCode: new FormControl(''),
    destinationAccountName: new FormControl(''),
    bankAccountId: new FormControl(''),

    sourceAccountId: new FormControl('', Validators.required),
    sourceAccountName: new FormControl(''),
    accountGroupId: new FormControl(''),
    accountGroupName: new FormControl({ value: '', disabled: true }),

    systemAmount: new FormControl(null, [Validators.required, Validators.min(0)]),
    amount: new FormControl(null, [Validators.required, Validators.min(0)]),
    amountDifference: new FormControl({ value: 0, disabled: true }),
   
    narration: new FormControl('', Validators.maxLength(250)),
    transactionNo: new FormControl('',Validators.required),    
    isAmountPaid: new FormControl(true,Validators.required),    
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

    bankName: new FormControl(''),
    chequeNumber: new FormControl(''),
    remark: new FormControl(''),

    voucherType: new FormControl(VoucherType.REC), // Default to REC
    isActive: new FormControl(true),
  });
  isUpdateMode: boolean = false;
  receiptId: any;
  isCashMode: boolean = false;  
  currentUserName:string = '';
  constructor(
    private masterService: MasterService,
    private employeesService: EmployeesService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private financeService: FinanceService,
    private dateUtcPipe: DateUtcPipe,
    private route: ActivatedRoute
  ) {
      const authData = this.authService.getUserAuthData();
      if (authData && authData.userId) {   
        this.companyId = authData.client?.clientId;
        this.currentUserName = authData.client?.userName;
      } 
  }  

ngOnInit(): void {

  this.receiptForm.patchValue({
    voucherDate: this.dateUtcPipe.transform(new Date(), 'input'),
    paymentType: PaymentType.Cash
  });

  this.onPaymentTypeChange(
    this.receiptForm.get('paymentType')?.value
  );

  this.receiptId = this.route.snapshot.paramMap.get('id');

  if (this.receiptId) {
    this.isUpdateMode = true;
    this.receiptForm.get('paymentType')?.disable();
  }

  if (!this.receiptId) {
  // New Receipt -> Default Yes
  this.receiptForm.patchValue({
    isAmountPaid: true
  });

  this.receiptForm.get('isAmountPaid')?.setErrors(null);
}

  // Load accounts first
  this.getAccountsByCompanyId(this.companyId);
}

getAccountsByCompanyId(companyId: any): void {
  this.masterService.getAccountsByCompanyId(companyId)
    .subscribe({
      next: (res: any[]) => {
        this.accounts = res;

        this.cashInHandAccount = this.accounts.find(
          acc => acc.accountCode === 'CIH'
        );

        // Get all accounts under BNK account group
        this.bankAccounts = this.accounts
        .filter(acc => acc.accountGroupCode === 'BNK')
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));       

        this.sourceAccounts = this.accounts.filter(
          acc => acc.accountCode !== 'CIH'
        );

        this.accountGroups = [
          ...new Map(
            res.map(acc => [
              acc.accountGroupId,
              {
                id: acc.accountGroupId,
                accountGroupCode: acc.accountGroupCode,
                accountGroupName: acc.accountGroupName
              }
            ])
          ).values()
        ];

        // Default Received In = Cash In Hand
        if (this.cashInHandAccount) {
          this.receiptForm.patchValue({
            destinationAccountId: this.cashInHandAccount.id,
            destinationAccountName: this.cashInHandAccount.accountName,
            destinationAccountCode: this.cashInHandAccount.accountCode
          });

          // Keep Received In disabled
          this.receiptForm.get('destinationAccountId')?.disable();
          this.receiptForm.get('destinationAccountCode')?.disable();
        }

        if (this.receiptId) {
          this.onGetReceiptById(this.receiptId);
        }
      },
      error: (error) => {
        this.toastService.error(
          error?.error?.message || 'Error loading accounts'
        );
      }
    });
}   
onSourceAccountChange(): void {
  const accountId = this.receiptForm.get('sourceAccountId')?.value;
  const selectedAccount = this.accounts.find(acc => Number(acc.id) === Number(accountId));

  if (!selectedAccount) {
    return;
  }

  this.receiptForm.patchValue({
    sourceAccountName: selectedAccount.accountName,
    accountGroupId: selectedAccount.accountGroupId,
    accountGroupName: `${selectedAccount.accountGroupCode} - ${selectedAccount.accountGroupName}`
  });
}
onGetReceiptById(id: any): void {
  this.financeService
    .getReceiptById(id, this.companyId)
    .subscribe({
      next: (receiptData: any) => {
        paymentType: PaymentType[receiptData.paymentType as keyof typeof PaymentType],

        this.receiptForm.patchValue({
          id: receiptData.id,
          companyId: receiptData.companyId,

          employeeId: receiptData.employeeId,
          employeeFullName: receiptData.employeeFullName,

          vehicleId: receiptData.vehicleId,
          vehicleNumber: receiptData.vehicleNumber,

          voucherDate: this.dateUtcPipe.transform(
            receiptData.voucherDate,
            'input'
          ),

          voucherNumber: receiptData.voucherNumber,

          // IMPORTANT: Do NOT use PaymentType[...] here
          paymentType: PaymentType[receiptData.paymentType as keyof typeof PaymentType],

          sourceAccountId: receiptData.sourceAccountId,
          sourceAccountName: receiptData.sourceAccountName,
          accountGroupId: receiptData.accountGroupId,
          accountGroupName: receiptData.accountGroupName,

          destinationAccountId: receiptData.destinationAccountId,
          destinationAccountCode: receiptData.destinationAccountCode,
          destinationAccountName: receiptData.destinationAccountName,

          // IMPORTANT:
          // Your bank dropdown is bound to bankAccountId.
          // Set it from the response.
          bankAccountId: receiptData.destinationAccountId,

          systemAmount: receiptData.systemAmount,
          amount: receiptData.amount,
          amountDifference: receiptData.amountDifference,

          narration: receiptData.narration,
          transactionNo: receiptData.transactionNo,

          isAmountPaid: receiptData.paidBy ? true : false,

          notes2000: receiptData.notes2000 === 0 ? null : receiptData.notes2000,
          notes1000: receiptData.notes1000 === 0 ? null : receiptData.notes1000,
          notes500: receiptData.notes500 === 0 ? null : receiptData.notes500,
          notes200: receiptData.notes200 === 0 ? null : receiptData.notes200,
          notes100: receiptData.notes100 === 0 ? null : receiptData.notes100,
          notes50: receiptData.notes50 === 0 ? null : receiptData.notes50,
          notes20: receiptData.notes20 === 0 ? null : receiptData.notes20,
          notes10: receiptData.notes10 === 0 ? null : receiptData.notes10,
          notes5: receiptData.notes5 === 0 ? null : receiptData.notes5,
          coins: receiptData.coins === 0 ? null : receiptData.coins,

          bankName: receiptData.bankName,
          chequeNumber: receiptData.chequeNumber,
          remark: receiptData.remark,

          voucherType: receiptData.voucherType,
          isActive: receiptData.isActive
        });

        // Build Account Group + Account dropdown
        const selectedAccount = this.accounts.find(
          acc =>
            Number(acc.id) ===
            Number(receiptData.sourceAccountId)
        );

        if (selectedAccount) {
          this.receiptForm.patchValue({
            accountGroupName:
              `${selectedAccount.accountGroupCode} - ${selectedAccount.accountGroupName}`
          });
        }

        // Apply payment type.
        const paymentType = PaymentType[receiptData.paymentType as keyof typeof PaymentType];
        this.receiptForm.patchValue({ paymentType,});

        // Apply payment type after patching the form.
        this.onPaymentTypeChange(paymentType);

        // Ensure the API-selected bank is restored.
        if (paymentType === PaymentType.Bank && receiptData.destinationAccountId) {
          this.setBankAccountFromReceipt(receiptData);
        }        
      },

      error: (error) => {
        this.toastService.error(
          error?.error?.message ||
          'Error fetching receipt details'
        );
      }
    });
}
onPaymentTypeChange(selectedValue: any): void {

  const bankNameCtrl = this.receiptForm.get('bankName');
  const chequeCtrl = this.receiptForm.get('chequeNumber');

  const paymentType = Number(selectedValue);

  this.isCashMode = paymentType === PaymentType.Cash;

  // Received In must ALWAYS remain disabled
  this.receiptForm.get('destinationAccountId')?.disable();
  this.receiptForm.get('destinationAccountCode')?.disable();

  if (this.isCashMode) {

    this.enableCashSection();

    bankNameCtrl?.clearValidators();
    chequeCtrl?.clearValidators();

    // Received In = Cash In Hand
    if (this.cashInHandAccount) {

      this.receiptForm.patchValue({
        destinationAccountId: this.cashInHandAccount.id,
        destinationAccountName: this.cashInHandAccount.accountName,
        destinationAccountCode: this.cashInHandAccount.accountCode,

        // Clear bank selection in cash mode
        bankAccountId: '',

        bankName: '',
        chequeNumber: '',
        remark: ''
      });
    }

  } else {

    this.disableCashSection();

    bankNameCtrl?.setValidators([Validators.required]);
    chequeCtrl?.setValidators([Validators.required]);

    /*
     * IMPORTANT
     *
     * First try to find the bank already selected in the form.
     *
     * This is important for UPDATE mode because
     * bankAccountId has already been populated from API.
     *
     * If nothing is selected, it means CREATE mode,
     * so select the default bank.
     */
    let selectedBankAccount = this.bankAccounts.find(
      acc =>
        Number(acc.id) ===
        Number(this.receiptForm.get('bankAccountId')?.value)
    );

    // CREATE MODE:
    // No existing bank -> select default bank.
    if (!selectedBankAccount) {

      selectedBankAccount =
        this.bankAccounts.find(
          acc => acc.isDefault === true
        ) || this.bankAccounts[0];
    }

    if (selectedBankAccount) {

      this.receiptForm.patchValue({
        bankAccountId: selectedBankAccount.id,

        destinationAccountId: selectedBankAccount.id,
        destinationAccountName: selectedBankAccount.accountName,
        destinationAccountCode: selectedBankAccount.accountCode,

        bankName: selectedBankAccount.accountName
      });
    }
  }

  bankNameCtrl?.updateValueAndValidity();
  chequeCtrl?.updateValueAndValidity();
}
private setBankAccountFromReceipt(receiptData: any): void {
  const bankAccountId = receiptData.destinationAccountId;
  if (!bankAccountId) {
    return;
  }
  const selectedBankAccount = this.bankAccounts.find(
    acc => Number(acc.id) === Number(bankAccountId)
  );

  if (!selectedBankAccount) {
    return;
  }

  this.receiptForm.patchValue({
    bankAccountId: selectedBankAccount.id,

    destinationAccountId: selectedBankAccount.id,
    destinationAccountName: selectedBankAccount.accountName,
    destinationAccountCode: selectedBankAccount.accountCode,

    bankName:
      receiptData.bankName ||
      selectedBankAccount.accountName
  });
}
onBankAccountChange(): void {

  const accountId =
    this.receiptForm.get('bankAccountId')?.value;

  if (!accountId) {
    return;
  }

  const selectedAccount = this.bankAccounts.find(
    acc =>  Number(acc.id) === Number(accountId));

  if (!selectedAccount) {
    return;
  }

  this.receiptForm.patchValue({
    destinationAccountId: selectedAccount.id,
    destinationAccountName: selectedAccount.accountName,
    destinationAccountCode: selectedAccount.accountCode,

    bankName: selectedAccount.accountName
  });
}

disableCashSection() {
  const controls = [
    'notes2000','notes1000','notes500','notes200',
    'notes100','notes50','notes20','notes10','notes5','coins'
  ];

  controls.forEach(ctrl => {
    this.receiptForm.get(ctrl)?.disable();
  });
}

enableCashSection() {
  const controls = [
    'notes2000','notes1000','notes500','notes200',
    'notes100','notes50','notes20','notes10','notes5','coins'
  ];

  controls.forEach(ctrl => {
    this.receiptForm.get(ctrl)?.enable();
  });
}
  // Calculate total number of notes
  getNotesCountTotal(): number {
  const val = this.receiptForm.value;
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
  // Existing function for total amount
  getNotesTotal(): number {
    const val = this.receiptForm.value;
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

  // Check mismatch
  isAmountMismatch(): boolean {
  const paymentType = this.receiptForm.get('paymentType')?.value;

  // Ignore mismatch if Bank is selected
  if (paymentType === PaymentType.Bank) {
    return false;
  }

  const amount = this.receiptForm.get('amount')?.value || 0;
  const notesTotal = this.getNotesTotal();

  return amount !== notesTotal;
}
  calculateDifference() {
  const systemAmount = this.receiptForm.get('systemAmount')?.value || 0;
  const amount = this.receiptForm.get('amount')?.value || 0;

  const difference = systemAmount - amount;

  this.receiptForm.patchValue({
    amountDifference: difference
  });
  }
 searchEmployee(event: any) {
  const keyword = event.target.value;
  if (keyword.length <= 1) {
    this.employees = [];
    return;
  }
  this.employeesService.searchEmployees(keyword, this.companyId).subscribe(
    (response: any) => {         
      this.employees = response;
    },
    (error: any) => {
      this.toastService.error(error.error.message || 'Error fetching Employees');
    }
  );
}
onEmployeeKeydown(event: KeyboardEvent): void {
  if (!this.employees || this.employees.length === 0) {
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.selectedEmployeeIndex < this.employees.length - 1) {
      this.selectedEmployeeIndex++;
    } else {
      this.selectedEmployeeIndex = 0;
    }
  }

  else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.selectedEmployeeIndex > 0) {
      this.selectedEmployeeIndex--;
    } else {
      this.selectedEmployeeIndex = this.employees.length - 1;
    }
  }

  else if (event.key === 'Enter') {
    event.preventDefault();
    if (this.selectedEmployeeIndex >= 0 && this.selectedEmployeeIndex < this.employees.length) {
      this.selectEmployee(
        this.employees[this.selectedEmployeeIndex]
      );
    }
  }

  else if (event.key === 'Escape') {
    event.preventDefault();

    this.employees = [];
    this.selectedEmployeeIndex = -1;
  }
}

selectEmployee(employee: any): void {
  this.receiptForm.patchValue({
    employeeId: employee.employeeId,
    employeeFullName: employee.employeeFullName
  });

  this.employees = [];
  this.selectedEmployeeIndex = -1;
}
searchVehicle(event: any): void {
  const keyword = event.target.value?.trim();

  this.selectedVehicleIndex = -1;

  if (!keyword || keyword.length < 2) {
    this.vehicles = [];
    return;
  }

  this.masterService.searchVehicles(keyword, this.companyId).subscribe(
    (response: any) => {
      this.vehicles = response || [];
      this.selectedVehicleIndex = -1;
    },
    (error: any) => {
      this.vehicles = [];
      this.selectedVehicleIndex = -1;

      this.toastService.error(
        error?.error?.message || 'Error fetching Vehicles'
      );
    }
  );
}  
selectVehicle(vehicle: any): void {

  if (!vehicle) {
    return;
  }

  this.receiptForm.patchValue({
    vehicleId: vehicle.id,
    vehicleNumber:
      `${vehicle.code} - ${vehicle.name} - ${vehicle.vehicleNumber}`
  });

  this.vehicles = [];
  this.selectedVehicleIndex = -1;
}

onVehicleKeydown(event: KeyboardEvent): void {
  if (!this.vehicles || this.vehicles.length === 0) {
    return;
  }

  // Arrow Down
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.selectedVehicleIndex < this.vehicles.length - 1) {
      this.selectedVehicleIndex++;
    } else {
      this.selectedVehicleIndex = 0;
    }
  }

  // Arrow Up
  else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.selectedVehicleIndex > 0) {
      this.selectedVehicleIndex--;
    } else {
      this.selectedVehicleIndex = this.vehicles.length - 1;
    }
  }

  // Enter
  else if (event.key === 'Enter') {
    event.preventDefault();
    if ( this.selectedVehicleIndex >= 0 && this.selectedVehicleIndex < this.vehicles.length) {
        this.selectVehicle(this.vehicles[this.selectedVehicleIndex]);
    }
  }

  // Escape
  else if (event.key === 'Escape') {
    event.preventDefault();
    this.vehicles = [];
    this.selectedVehicleIndex = -1;
  }
}  
onAmountPaidChange(event: any) {
  const value = event.target.value === 'true';

  const control = this.receiptForm.get('isAmountPaid');

  control?.setValue(value);

  if (value) {
    control?.setErrors(null);
  } else {
    control?.setErrors({ notPaid: true });
  }

  control?.updateValueAndValidity();
}
private prepareReceiptData(): any {
  const data = this.receiptForm.getRawValue();

  return {
    ...data,
    notes2000: data.notes2000 ?? 0,
    notes1000: data.notes1000 ?? 0,
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
onSubmitReceipt() {
  // Validation: amount mismatch
  if (this.isAmountMismatch()) {
    this.toastService.error("Notes total must match Amount");
  return;
}

// Form validation
if (!this.receiptForm.valid) {
  this.toastService.error('Please fill all required fields correctly');
  return;
}

  // Patch common values
  this.receiptForm.patchValue({
    companyId: this.companyId,
    paymentType: Number(this.receiptForm.get('paymentType')?.value),
    voucherDate: this.dateUtcPipe.transform(this.receiptForm.get('voucherDate')?.value, 'withCurrentTime'),
    voucherType: VoucherType.REC,
  });
  
  // null in UI -> 0 in API request
  const receiptData = this.prepareReceiptData();
  
  // Decide Create vs Update
  if (this.receiptId) {
    this.updateReceipt(receiptData);
  } else {
    this.createReceipt(receiptData);
  }
}

private createReceipt(receiptData: any) {
  this.financeService.createReceipt(receiptData).subscribe({
    next: (response: any) => {
      this.toastService.success(response.message || 'Receipt created successfully');
      this.router.navigate(['finance/receipts']);
    },
    error: (error: any) => {
       this.receiptForm.patchValue({
        voucherDate: this.dateUtcPipe.transform(receiptData.voucherDate, 'input'),    
      });
      this.toastService.error(error?.error?.message || 'Error creating receipt');
    }
  });
}
private updateReceipt(receiptData: any) {
  this.financeService.updateReceipt(this.receiptId, receiptData).subscribe({
    next: (response: any) => {
      this.toastService.success(response.message || 'Receipt updated successfully');
      this.router.navigate(['finance/receipts']);
    },
    error: (error: any) => {
      this.receiptForm.patchValue({
        voucherDate: this.dateUtcPipe.transform(receiptData.voucherDate, 'input'),    
      });
      this.toastService.error(error?.error?.message || 'Error updating receipt');
    }
  });
}
isInvalid(controlName: string): boolean {
  const control = this.receiptForm.get(controlName);
  return !!(control && control.touched && control.invalid);
}
focusNext(next: HTMLElement) {
  next.focus();
}

}
