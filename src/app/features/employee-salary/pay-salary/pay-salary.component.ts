import { Component } from '@angular/core';
import { PaymentType } from '../../../enums/permission.enum';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pay-salary',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './pay-salary.component.html',
  styleUrl: './pay-salary.component.scss'
})
export class PaySalaryComponent {
companyId: any;
salaryId: any;
salaryData: any;
employeeId: any;
PaymentType = PaymentType;
bankName: string = '';
referenceNumber: string = '';
paymentDetails = {
  paymentType: PaymentType.Cash,
  bankName: '',
  referenceNumber: ''
};

cashNotesForm = new FormGroup({
  notes2000: new FormControl(0),
  notes500: new FormControl(0),
  notes200: new FormControl(0),
  notes100: new FormControl(0),
  notes50: new FormControl(0),
  notes20: new FormControl(0),
  notes10: new FormControl(0),
  notes5: new FormControl(0),
  coins: new FormControl(0)
});

constructor(
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
  this.getEmployeeSalaryById();
}

// GET SALARY DETAILS
getEmployeeSalaryById() {
const payload = {salaryId: Number(this.salaryId),employeeId: Number(this.employeeId),companyId: this.companyId};

this.financeService.getEmployeeSalaryById(payload)
  .subscribe({next: (res: any) => {
      this.salaryData = res;
      if (this.salaryData == null) {
        this.toastService.warning('Salary data not found');
      }
    },
    error: (err) => {
      this.toastService.error(err?.error?.message ||'Error loading salary data'
      );
    }
  });
}
// PAYMENT TYPE CHANGE
onPaymentTypeChange() {
  if (Number(this.paymentDetails.paymentType) === PaymentType.Bank) {
    this.cashNotesForm.disable();    
    this.resetNotes();    
  }else {
    this.cashNotesForm.enable();
  }
}
// RESET NOTES
resetNotes() {
  this.cashNotesForm.patchValue({
    notes2000: 0,
    notes500: 0,
    notes200: 0,
    notes100: 0,
    notes50: 0,
    notes20: 0,
    notes10: 0,
    notes5: 0,
    coins: 0
  });
}

// NOTES TOTAL COUNT
getNotesCountTotal(): number {
const val =
  this.cashNotesForm.value;
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
  const val = this.cashNotesForm.value;
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
// VALIDATE CASH TOTAL AMOUNT MATCH
isAmountMismatch(): boolean {
  if (Number(this.PaymentType) === PaymentType.Bank) {
    return true; // Skip cash validation for bank payments
  }

  const cashTotal = this.getNotesTotal();

  return Number(this.salaryData?.netPayableSalary || 0) !== cashTotal;
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
// PAY SALARY
onPayAmount() {

  // CONFIRMATION ALERT
  const isConfirmed = confirm('Are you sure you want to pay this salary?');

  if (!isConfirmed) {
    return;
  }

  // CASH VALIDATION
  if (this.isAmountMismatch()) {
    this.toastService.error('Cash notes total must match Salary Amount');
    return;
  }

  // BANK VALIDATION
  if (
    Number(this.paymentDetails.paymentType) === PaymentType.Bank &&
    !this.paymentDetails.bankName
  ) {
    this.toastService.error('Please enter Bank Name');
    return;
  }

  // Set null/empty note counts to 0 before calculation
  this.handleCashSection();

  const payload = {    
    companyId: this.companyId,
    employeeId: this.salaryData.employeeId,
    salaryGenerationId: Number(this.salaryId),
    amount: this.salaryData.salaryAmount,
    paymentType: Number(this.paymentDetails.paymentType),
    bankName: this.paymentDetails.bankName,
    referenceNumber: this.paymentDetails.referenceNumber,

    notes2000: this.cashNotesForm.value.notes2000,
    notes500: this.cashNotesForm.value.notes500,
    notes200: this.cashNotesForm.value.notes200,
    notes100: this.cashNotesForm.value.notes100,
    notes50: this.cashNotesForm.value.notes50,
    notes20: this.cashNotesForm.value.notes20,
    notes10: this.cashNotesForm.value.notes10,
    notes5: this.cashNotesForm.value.notes5,
    coins: this.cashNotesForm.value.coins
  };

  this.financeService.payEmployeeSalary(payload)
    .subscribe({
      next: (res: any) => {
        this.toastService.success(res?.message || 'Salary paid successfully');
        this.router.navigate(['/employee-salary']);
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error paying salary');
      }
    });
}

}
