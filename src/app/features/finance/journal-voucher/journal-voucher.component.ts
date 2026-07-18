import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { FinanceService } from '../../../services/finance.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-journal-voucher',
  standalone: true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './journal-voucher.component.html',
  styleUrl: './journal-voucher.component.scss'
})
export class JournalVoucherComponent {
  companyId: any;
  jvId: any;
  isUpdateMode: boolean = false;
  sourceEmployees: any[] = [];
  destinationEmployees: any[] = [];  
  jvForm = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(0),

    voucherDate: new FormControl('', Validators.required),
    voucherNumber: new FormControl({ value: 0, disabled: true }),
    voucherType: new FormControl('JV'),

    sourceAccountId: new FormControl('', Validators.required),
    sourceAccountName: new FormControl('', Validators.required),

    destinationAccountId: new FormControl('', Validators.required),
    destinationAccountName: new FormControl('', Validators.required),

    sourceEmployeeAdvanceId: new FormControl(0),
    destinationEmployeeAdvanceId: new FormControl(0),

    amount: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),

  netSalary: new FormControl({ value: '', disabled: true }),
  narration: new FormControl(''),
  createdByName : new FormControl({ value: '', disabled: true }),
  });
  constructor(        
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
    }
  }
  
ngOnInit(): void {  
  this.jvForm.patchValue({
    voucherDate: this.dateUtcPipe.transform(new Date(), 'input')    
  });  

  this.jvId = this.route.snapshot.paramMap.get('id');
  if (this.jvId) {
    this.isUpdateMode = true;
    this.getJournalVoucherById(this.jvId);    
  }      
  this.disableAlwaysDisabledFields();
}  
getJournalVoucherById(id: any) {

  const payload = {
    id: id,
    companyId: this.companyId
  };

  this.financeService.getJournalVoucherById(payload)
    .subscribe({

      next: (data: any) => {
        this.jvForm.patchValue({

          id: data.id,
          voucherDate: this.dateUtcPipe.transform(
            data.voucherDate,
            'input'
          ),

          voucherNumber: data.voucherNumber,

          sourceAccountId: data.sourceAccountId,
          sourceAccountName: data.sourceAccountName,
          sourceEmployeeAdvanceId: data.sourceEmployeeAdvanceId,

          destinationAccountId: data.destinationAccountId,
          destinationAccountName: data.destinationAccountName,
          destinationEmployeeAdvanceId:
            data.destinationEmployeeAdvanceId,

          amount: data.amount,

          netSalary: data.netSalary,

          narration: data.narration,

          createdByName: data.createdByName
        });

      },

      error: err => {
        this.toastService.error(
          err?.error?.message ||
          'Unable to load Journal Voucher'
        );
      }

    });

}
searchSourceEmployee(event: any) {
  const keyword = event.target.value;

  if (keyword.length < 2) {
    this.sourceEmployees = [];
    return;
  }

  const destinationId = this.jvForm.get('destinationAccountId')?.value;

  this.financeService.searchJVEmployee(keyword, this.companyId)
    .subscribe(res => {
      this.sourceEmployees = res.filter(
        (emp: any) => emp.employeeId !== destinationId
      );
    });
}
selectSourceEmployee(employee: any) {
  this.jvForm.patchValue({
    sourceAccountId: employee.employeeId,
    sourceAccountName: employee.employeeFullName,
    sourceEmployeeAdvanceId:employee.employeeAdvanceId,
  });

  this.sourceEmployees = [];
}

searchDestinationEmployee(event: any) {
  const keyword = event.target.value;

  if (keyword.length < 2) {
    this.destinationEmployees = [];
    return;
  }

  const sourceId = this.jvForm.get('sourceAccountId')?.value;

  this.financeService.searchJVEmployee(keyword, this.companyId)
    .subscribe(res => {      
      this.destinationEmployees = res.filter(
      (emp: any) => emp.employeeId !== sourceId
      );
    });
}
selectDestinationEmployee(employee: any) {  
  this.jvForm.patchValue({
    destinationAccountId: employee.employeeId,
    destinationAccountName: employee.employeeFullName,
    destinationEmployeeAdvanceId: employee.employeeAdvanceId,
    netSalary: employee.monthlySalary
  });

  this.destinationEmployees = [];
}

clearSourceAccount() {
  this.jvForm.patchValue({
    sourceAccountId: '',
    sourceAccountName: ''
  });

  this.sourceEmployees = [];
}
clearDestinationAccount() {
  this.jvForm.patchValue({
    destinationAccountId: '',
    destinationAccountName: '',
    netSalary : ''
  });

  this.destinationEmployees = [];
}

focusNext(next: HTMLElement) {
  next.focus();
}
private disableAlwaysDisabledFields() {
  [
    'voucherNumber',
    'netSalary',
    'createdByName'
  ].forEach(field => {
    this.jvForm.get(field)?.disable({
      emitEvent: false
    });
  });
}
onSaveJV() {
  if (!this.jvForm.valid) {
    return;
  }
  this.jvForm.patchValue({
    companyId: this.companyId,
    voucherDate: this.dateUtcPipe.transform(this.jvForm.get('voucherDate')?.value, 'withCurrentTime')
    });

  const payload = this.jvForm.getRawValue();
  payload.companyId = this.companyId;
  if (this.isUpdateMode) {
    this.updateJournalVoucher(payload);
  } else {
    this.createJournalVoucher(payload);
  }
}
private createJournalVoucher(data: any) {
  this.financeService.createJournalVoucher(data)
    .subscribe({
      next: res => {
        this.toastService.success(res?.message || 'Journal Voucher Created');
        this.router.navigate(['finance/journal-vouchers']);
      },
      error: err =>
        this.toastService.error(
          err?.error?.message || 'Error creating Journal Voucher')
    });
}
private updateJournalVoucher(data: any) {
  this.financeService
      .updateJournalVoucher(this.jvId, data)
      .subscribe({
        next: res => {
          this.toastService.success(res?.message || 'Journal Voucher Updated Successfully');
          this.router.navigate(['finance/journal-vouchers']);
        },
        error: err =>
          this.toastService.error(err?.error?.message || 'Error updating Journal Voucher')
      });
}
}
