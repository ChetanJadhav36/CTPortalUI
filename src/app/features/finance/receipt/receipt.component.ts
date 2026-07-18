import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  bankAccount: any;
  vehicleList: any[] = [];
  employees: any[] = [];
  vehicles: any[] = [];
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
    notes2000: new FormControl(0),
    notes1000: new FormControl(0),
    notes500: new FormControl(0),
    notes100: new FormControl(0),
    notes200: new FormControl(0),
    notes50: new FormControl(0),
    notes20: new FormControl(0),
    notes10: new FormControl(0),
    notes5: new FormControl(0),
    coins: new FormControl(0),

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

      this.bankAccount = this.accounts.find(
        acc => acc.accountCode === 'BNK'
      );

        // Account Name dropdown should not show Cash In Hand
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
        
        // Default = Cash
        if (this.cashInHandAccount) {
          this.receiptForm.patchValue({
            destinationAccountId: this.cashInHandAccount.id,
            destinationAccountName: this.cashInHandAccount.accountName,
            destinationAccountCode: this.cashInHandAccount.accountCode
          });          

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
        this.receiptForm.patchValue({
          id: receiptData.id,
          companyId: receiptData.companyId,

          employeeId: receiptData.employeeId,
          employeeFullName: receiptData.employeeFullName,

          vehicleId: receiptData.vehicleId,
          vehicleNumber: receiptData.vehicleNumber,

          voucherDate: this.dateUtcPipe.transform(receiptData.voucherDate,'input'),

          voucherNumber: receiptData.voucherNumber,
          paymentType: PaymentType[receiptData.paymentType as keyof typeof PaymentType],

          sourceAccountId: receiptData.sourceAccountId,
          sourceAccountName: receiptData.sourceAccountName,
          accountGroupId: receiptData.accountGroupId,
          accountGroupName: receiptData.accountGroupName,

          destinationAccountId: receiptData.destinationAccountId,
          destinationAccountName: receiptData.destinationAccountName,

          systemAmount: receiptData.systemAmount,
          amount: receiptData.amount,
          amountDifference: receiptData.amountDifference,

          narration: receiptData.narration,
          transactionNo: receiptData.transactionNo,

          isAmountPaid: receiptData.paidBy ? true : false,

          notes2000: receiptData.notes2000,
          notes1000: receiptData.notes1000,
          notes500: receiptData.notes500,
          notes200: receiptData.notes200,
          notes100: receiptData.notes100,
          notes50: receiptData.notes50,
          notes20: receiptData.notes20,
          notes10: receiptData.notes10,
          notes5: receiptData.notes5,
          coins: receiptData.coins,

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
            accountGroupName: selectedAccount.accountGroupName
          });         
        }

        this.onPaymentTypeChange(
          this.receiptForm.get('paymentType')?.value
        );
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

  this.isCashMode = selectedValue === PaymentType.Cash;

  if (this.isCashMode) {

    // Enable cash notes section
    this.enableCashSection();

    // Remove bank validations
    bankNameCtrl?.clearValidators();
    chequeCtrl?.clearValidators();

    // Select Cash In Hand account automatically
    if (this.cashInHandAccount) {
      this.receiptForm.patchValue({
        destinationAccountId: this.cashInHandAccount.id,
        destinationAccountName: this.cashInHandAccount.accountName,
        destinationAccountCode: this.cashInHandAccount.accountCode,
        bankName: '',
        chequeNumber: '',
        remark: ''
      });
    }

  } else {

    // Disable cash notes section
    this.disableCashSection();

    // Bank fields required
    bankNameCtrl?.setValidators([Validators.required]);
    chequeCtrl?.setValidators([Validators.required]);

    // Select BNK account automatically
    if (this.bankAccount) {
      this.receiptForm.patchValue({
        destinationAccountId: this.bankAccount.id,
        destinationAccountName: this.bankAccount.accountName,
        destinationAccountCode: this.bankAccount.accountCode,

        // Auto-fill bank name textbox
        bankName: this.bankAccount.accountName
      });
    }
  }

  bankNameCtrl?.updateValueAndValidity();
  chequeCtrl?.updateValueAndValidity();
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
  selectEmployee(employee: any) {
  this.receiptForm.patchValue({
  employeeId: employee.employeeId,
  employeeFullName: employee.employeeFullName
  });

  this.employees = [];
  }
  searchVehicle(event: any) {
  const keyword = event.target.value;

  if (keyword.length < 2) {
    this.vehicles = [];
    return;
  }

  this.masterService.searchVehicles(keyword, this.companyId).subscribe(
    (response: any) => {
      this.vehicles = response;
    },
    (error: any) => {
      this.toastService.error(error.error.message || 'Error fetching Vehicles');
    }
  );
  }
  selectVehicle(vehicle: any) {
    this.receiptForm.patchValue({
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.code + ' - ' + vehicle.name + ' - ' + vehicle.vehicleNumber
    });

    this.vehicles = [];
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
    const control = this.receiptForm.get(ctrl);

    if (control?.value == null || control.value === '') {
      control?.setValue(0);
    }
  });
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
  if (this.receiptForm.get('paymentType')?.value === PaymentType.Cash) {
    this.handleCashSection();    
  }
  
  const receiptData = this.receiptForm.getRawValue();  
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
