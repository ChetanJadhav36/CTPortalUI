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

  selectedSourceEmployeeIndex: number = -1;
  selectedDestinationEmployeeIndex: number = -1;

  jvForm = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(0),

    voucherDate: new FormControl('', Validators.required),
    voucherNumber: new FormControl({ value: 0, disabled: true }),
    voucherType: new FormControl('JV'),

    sourceEmployeeId: new FormControl('', Validators.required),
    sourceEmployeeName: new FormControl('', Validators.required),

    destinationEmployeeId: new FormControl('', Validators.required),
    destinationEmployeeName: new FormControl('', Validators.required),
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

          sourceEmployeeId: data.sourceEmployeeId,
          sourceEmployeeName: data.sourceEmployeeName,         

          destinationEmployeeId: data.destinationEmployeeId,
          destinationEmployeeName: data.destinationEmployeeName,          
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
searchSourceEmployee(event: any): void {
  const keyword = event.target.value.trim();

  // Reset keyboard selection
  this.selectedSourceEmployeeIndex = -1;

  // User is typing again, so clear previously selected employee
  this.jvForm.patchValue({
    sourceEmployeeId: ''
  });

  if (!keyword || keyword.length < 2) {
    this.sourceEmployees = [];
    return;
  }

  const destinationId =
    this.jvForm.get('destinationAccountId')?.value;

  this.financeService
    .searchJVEmployee(keyword, this.companyId)
    .subscribe({
      next: (response: any[]) => {
        this.sourceEmployees = (response || []).filter(
          (emp: any) =>
            Number(emp.employeeId) !== Number(destinationId)
        );
        this.selectedSourceEmployeeIndex = -1;
      },

      error: (error: any) => {
        this.sourceEmployees = [];
        this.toastService.error(
          error?.error?.message ||
          'Error fetching employees'
        );
      }
    });
}
selectSourceEmployee(employee: any): void {

  this.jvForm.patchValue({
    sourceEmployeeId: employee.employeeId,
    sourceEmployeeName: employee.employeeFullName
  });

  // Close dropdown
  this.sourceEmployees = [];

  // Reset keyboard selection
  this.selectedSourceEmployeeIndex = -1;
}

onSourceEmployeeKeydown(event: KeyboardEvent): void {

  if (!this.sourceEmployees || this.sourceEmployees.length === 0) {
    return;
  }

  // Arrow Down
  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (
      this.selectedSourceEmployeeIndex <
      this.sourceEmployees.length - 1
    ) {
      this.selectedSourceEmployeeIndex++;
    } else {
      this.selectedSourceEmployeeIndex = 0;
    }
  }

  // Arrow Up
  else if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (this.selectedSourceEmployeeIndex > 0) {
      this.selectedSourceEmployeeIndex--;
    } else {
      this.selectedSourceEmployeeIndex =
        this.sourceEmployees.length - 1;
    }
  }

  // Enter
  else if (event.key === 'Enter') {
    event.preventDefault();

    if (
      this.selectedSourceEmployeeIndex >= 0 &&
      this.selectedSourceEmployeeIndex < this.sourceEmployees.length
    ) {
      const employee =
        this.sourceEmployees[this.selectedSourceEmployeeIndex];

      this.selectSourceEmployee(employee);
    }
  }

  // Escape
  else if (event.key === 'Escape') {
    event.preventDefault();

    this.sourceEmployees = [];
    this.selectedSourceEmployeeIndex = -1;
  }
}
searchDestinationEmployee(event: any): void {
  const keyword = event.target.value.trim();

  // Reset keyboard selection
  this.selectedDestinationEmployeeIndex = -1;

  // User is typing again
  this.jvForm.patchValue({
    destinationEmployeeId: '',
    netSalary: ''
  });

  if (!keyword || keyword.length < 2) {
    this.destinationEmployees = [];
    return;
  }

  const sourceId =
    this.jvForm.get('sourceAccountId')?.value;

  this.financeService
    .searchJVEmployee(keyword, this.companyId)
    .subscribe({
      next: (response: any[]) => {

        this.destinationEmployees = (response || []).filter(
          (emp: any) =>
            Number(emp.employeeId) !== Number(sourceId)
        );

        this.selectedDestinationEmployeeIndex = -1;
      },

      error: (error: any) => {
        this.destinationEmployees = [];

        this.toastService.error(
          error?.error?.message ||
          'Error fetching employees'
        );
      }
    });
}

selectDestinationEmployee(employee: any): void {

  this.jvForm.patchValue({
    destinationEmployeeId: employee.employeeId,
    destinationEmployeeName: employee.employeeFullName,
    netSalary: employee.monthlySalary
  });

  // Close dropdown
  this.destinationEmployees = [];

  // Reset keyboard selection
  this.selectedDestinationEmployeeIndex = -1;
}

onDestinationEmployeeKeydown(event: KeyboardEvent): void {
  if (
    !this.destinationEmployees ||
    this.destinationEmployees.length === 0
  ) {
    return;
  }

  // Arrow Down
  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (
      this.selectedDestinationEmployeeIndex <
      this.destinationEmployees.length - 1
    ) {
      this.selectedDestinationEmployeeIndex++;
    } else {
      this.selectedDestinationEmployeeIndex = 0;
    }
  }

  // Arrow Up
  else if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (this.selectedDestinationEmployeeIndex > 0) {
      this.selectedDestinationEmployeeIndex--;
    } else {
      this.selectedDestinationEmployeeIndex =
        this.destinationEmployees.length - 1;
    }
  }

  // Enter
  else if (event.key === 'Enter') {
    event.preventDefault();

    if (
      this.selectedDestinationEmployeeIndex >= 0 &&
      this.selectedDestinationEmployeeIndex <
        this.destinationEmployees.length
    ) {
      const employee =
        this.destinationEmployees[
          this.selectedDestinationEmployeeIndex
        ];

      this.selectDestinationEmployee(employee);
    }
  }

  // Escape
  else if (event.key === 'Escape') {
    event.preventDefault();

    this.destinationEmployees = [];
    this.selectedDestinationEmployeeIndex = -1;
  }
}


clearSourceAccount() {
  this.jvForm.patchValue({
    sourceEmployeeId: '',
    sourceEmployeeName: ''
  });

  this.sourceEmployees = [];
}
clearDestinationAccount(): void {
  this.jvForm.patchValue({
    destinationEmployeeId: '',
    destinationEmployeeName: '',
    netSalary: ''
  });

  this.destinationEmployees = [];
  this.selectedDestinationEmployeeIndex = -1;
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
