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
import { PaymentType, TransactionStatus, VoucherType } from '../../../enums/permission.enum';
import { of, switchMap, tap } from 'rxjs';

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
  
   // Expose the enum to the template
  PaymentType = PaymentType;  // <-- THIS IS CRUCIAL
  VoucherType = VoucherType;  // <-- THIS IS CRUCIAL
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
  sourceAccountCode: new FormControl({ value: '', disabled: true }),
  sourceAccountName: new FormControl({ value: '', disabled: true }),

  netSalary: new FormControl({ value: '', disabled: true }),
  advanceAmount: new FormControl(0, [Validators.required, Validators.min(0)]),
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

  voucherType: new FormControl(VoucherType.ADV), // Default to EXP
});

cashNotesForm = new FormGroup({ 
  id: new FormControl(0), // or transactionId
  voucherId: new FormControl(0),
  companyId: new FormControl(0),
  voucherType: new FormControl(VoucherType.ADV),
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
        this.accounts = res;
        // Source Accounts = Cash In Hand + Bank
        this.sourceAccounts = this.accounts.filter(
          acc => acc.accountCode === 'CIH' || acc.accountCode === 'BNK'
        );

        // Destination Accounts = Everything except Cash In Hand + Bank
        this.destinationAccounts = this.accounts.filter(
          acc => acc.accountCode !== 'CIH' && acc.accountCode !== 'BNK'
        );

        const cashInHand = this.accounts.find(
          acc => acc.accountCode === 'CIH'
        );         

        if (cashInHand) {
          this.draftForm.patchValue({
            sourceAccountId: cashInHand.id,
            sourceAccountCode: cashInHand.accountCode,
            sourceAccountName: cashInHand.accountName
          });
        }

        if (this.employeeAdvanceId) {
          this.getEmployeeAdvanceById(this.employeeAdvanceId);
        }   
        this.onPaymentTypeChange(this.draftForm.get('paymentType')?.value);             
      },
      error: err => {
        this.toastService.error(
          err?.error?.message || 'Error loading accounts'
        );
      }
    });
}
getEmployeeAdvanceById(id: any) {
var employeeAdvancePayload = { id: id, companyId: this.companyId, voucherType: VoucherType.EXP };
  this.financeService.getEmployeeAdvanceById(employeeAdvancePayload).subscribe(
    (employeeAdvanceData: any) => {      
      this.currentStatus = TransactionStatus[employeeAdvanceData.status as keyof typeof TransactionStatus];
      this.draftForm.patchValue({                    
          voucherDate: this.dateUtcPipe.transform(employeeAdvanceData.voucherDate, 'input'),

          sourceAccountId:employeeAdvanceData.sourceAccountId,          
          sourceAccountName: employeeAdvanceData.sourceAccountName,          
          sourceAccountCode: employeeAdvanceData.sourceAccountCode,

          employeeId : employeeAdvanceData.employeeId,
          employeeFullName: employeeAdvanceData.employeeFullName,    
          netSalary:     employeeAdvanceData.monthlySalary,
          
          advanceAmount: employeeAdvanceData.advanceAmount,
          narration: employeeAdvanceData.narration,
          transactionNo: employeeAdvanceData.transactionNo,         
          paymentType: PaymentType[employeeAdvanceData.paymentType as keyof typeof PaymentType],
          bankName: employeeAdvanceData.bankName,
          chequeNumber: employeeAdvanceData.chequeNumber,
          remark: employeeAdvanceData.remark,
          transactionStatus: employeeAdvanceData.status, // Assuming API returns status as string like 'Draft', 'Approved', etc.                            

          createdByName: employeeAdvanceData.createdByName,
          approvedByName: employeeAdvanceData.approvedByName          
      });      

      if (employeeAdvanceData) {
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
          coins: employeeAdvanceData.coins,
        })
      }      
      this.applyStatusRules();
      this.onPaymentTypeChange(this.draftForm.get('paymentType')?.value);
      this.cd.detectChanges(); // force refresh
      const selectedAccount = this.accounts.find(
    acc =>
      Number(acc.id) ===
      Number(employeeAdvanceData.destinationAccountId)
    );

    },
    (error: any) => {
      this.toastService.error(error?.error?.message || 'Error fetching employee advance details');
    }
  );
}
private applyStatusRules(): void {

const paymentType = this.draftForm.get('paymentType')?.value;
switch (this.currentStatus) {
  case TransactionStatus.Draft:
    // Draft => Editable
    this.draftForm.enable();
    this.disableAlwaysDisabledFields();
    this.cashNotesForm.disable();      
    break;

  case TransactionStatus.Approved:
      this.draftForm.disable();
      if (paymentType === PaymentType.Bank) {
        this.cashNotesForm.disable();
      } else {
        this.cashNotesForm.enable();
      }
      break;

  case TransactionStatus.Paid:
    // Paid => Everything locked
    this.draftForm.disable();
    this.cashNotesForm.disable();
    break;
}
}

private alwaysDisabledFields: string[] = [
  'voucherNumber',
  'entryType',
  'sourceAccountId',
  'sourceAccountCode',
  'sourceAccountName',
  'netSalary'   ,
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

onPaymentTypeChange(selectedValue: any) {
  const paymentType = Number(selectedValue);
  this.isCashMode = paymentType === PaymentType.Cash;
  if (paymentType === PaymentType.Cash) {
    this.setSourceAccount('CIH');
    this.cashNotesForm.enable();
  } else if (paymentType === PaymentType.Bank) {
    this.setSourceAccount('BNK');
    this.setNotesToZero();
    this.cashNotesForm.disable();
  }
  this.applyStatusRules();
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
  const paymentMode = Number(this.draftForm.get('paymentType')?.value);

  // Ignore mismatch for Bank
  if (paymentMode === PaymentType.Bank) {
    return false;
  }

  const amount = this.draftForm.get('advanceAmount')?.value || 0;
  const notesTotal = this.getNotesTotal();

  return amount !== notesTotal;
}

searchEmployee(event: any) {
  const keyword = event.target.value;

   // Clear previously selected employee details
  this.draftForm.patchValue({
    employeeId: '',
    netSalary: '',
  });

  if (keyword.length <= 1) {    
    this.employees = [];        
    return;
  }
  this.employeesService.searchEmployeeAdvancePayment(keyword, this.companyId).subscribe(
    res => this.employees = res,
    err => this.toastService.error(err?.error?.message || 'Error fetching employees')
  );
}
selectEmployee(employee:any) {
    this.draftForm.patchValue({
      employeeId: employee.employeeId,
      employeeFullName : employee.employeeFullName,
      netSalary: employee.monthlySalary
    });

    this.employees = [];
  }

isInvalid(controlName: string): boolean {
  const control = this.draftForm.get(controlName);
  return !!(control && control.touched && control.invalid);
}

focusNext(next: HTMLElement) {
  next.focus();
}
onSubmitEmployeeAdvance() {    
  if (!this.draftForm.valid) {
    this.toastService.error('Please fill all required fields correctly');
    return;
  }

  this.draftForm.patchValue({
    companyId: this.companyId,
    voucherDate: this.dateUtcPipe.transform(this.draftForm.get('voucherDate')?.value, 'withCurrentTime'),
    paymentType: Number(this.draftForm.get('paymentType')?.value),
    voucherType: VoucherType.ADV
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
      this.toastService.success(res?.message || 'Voucher transaction updated successfully');
      this.router.navigate(['finance/employee-advances']);
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
  if (this.isAmountMismatch() && this.draftForm.get('paymentType')?.value === PaymentType.Cash) {
    this.toastService.error("Notes total must match Amount");
    return;
  }

  if (!this.cashNotesForm.valid && this.draftForm.get('paymentType')?.value === PaymentType.Cash) {
    this.toastService.error('Please fill cash notes correctly');
    return;
  }

  // Set null/empty note counts to 0 before calculation
  this.handleCashSection();
  var payload = this.cashNotesForm.getRawValue();
  payload.id = this.employeeAdvanceId;
  payload.companyId = this.companyId;
  payload.voucherType = VoucherType.ADV;  

  if (this.draftForm.get('paymentType')?.value === PaymentType.Cash) {
    payload.paymentType = PaymentType.Cash
  }
  else if(this.draftForm.get('paymentType')?.value === PaymentType.Bank){
    payload.paymentType = PaymentType.Bank
  }
  this.financeService.payEmployeeAdvance(payload).subscribe({
    next: res => {
      this.toastService.success(res?.message || 'Payment successful');
      this.router.navigate(['finance/employee-advances']);
    },
    error: err =>
      this.toastService.error(err?.error || 'Error processing payment')
  });
}  
}
