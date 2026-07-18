import { Component, ViewChild } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TooltipModule } from '@coreui/angular';
import { SalaryApprovalConfirmationPopUpComponent } from '../salary-approval-confirmation-pop-up/salary-approval-confirmation-pop-up.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-generate-salary',
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule,TableModule,TooltipModule,SalaryApprovalConfirmationPopUpComponent],
  templateUrl: './generate-salary.component.html',
  styleUrl: './generate-salary.component.scss'
})
export class GenerateSalaryComponent {
  companyId: number = 0;  
  generatedSalaryMonths: any[] = [];
  salaryReport: any[] = [];
  pendingTempSalary: string = '';
  salaryMonth: number = ((new Date().getMonth() + 11) % 12) + 1;
  salaryYear: number = new Date().getFullYear();
  loading: boolean = false;

  selectedEmployees: any[] = [];
  employee:any = {};
  allSalaryEmployeesSelected = false;

  @ViewChild(SalaryApprovalConfirmationPopUpComponent)
  popup!: SalaryApprovalConfirmationPopUpComponent;

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private toastService: ToastService
  ) {

    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit(): void {
    this.getGeneratedMonths();    
    this.loadSalaryReport();
  }

  getPageTitle(): string {
    return 'Salary Management';
  }

  generateTempSalary(): void {
    const payload = {
      companyId: this.companyId,
      salaryMonth: this.salaryMonth,
      salaryYear: this.salaryYear,
      otherDeductionAmount: 0,
      otherAdditionalAmount: 0,
      remarks: 'Temp Salary Generated'
    };

    this.financeService.generateTempSalaryForMonth(payload)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(res.message);
          this.loadSalaryReport();          
        },
        error: (err: any) => {
          this.toastService.error(
            err.error?.message || 'Error generating temp salary.'
          );
        }
      });
  }

  deleteTempSalary(): void {
    const payload = {
      companyId: this.companyId,
      salaryMonth: this.salaryMonth,
      salaryYear: this.salaryYear
    };

    this.financeService.deleteTempSalary(payload)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(res.message);
          this.salaryReport = [];
          this.pendingTempSalary = '';
        },
        error: (err: any) => {
          this.toastService.error(err.error?.message);
        }
      });
  }

  loadSalaryReport(): void {
  const payload = {
    companyId: this.companyId,
    salaryMonth: this.salaryMonth,
    salaryYear: this.salaryYear,    
  };

 this.financeService.getTempEmployeeSalaryByMonth(payload).subscribe({
    next: (res: any) => {
       this.salaryReport = res.map((item: any) => ({...item,
        isSelected: item.status === 'Approved'
      }));

    this.allSalaryEmployeesSelected = false;

    if (res.length === 0) {
      this.toastService.warning('No salary records found.');
    }
    },
    error: (err: any) => {
      console.error(err);
    }
  });
} 

  getGeneratedMonths(): void {
    this.financeService.generatedMonths(this.companyId)
      .subscribe({
        next: (res: any) => {
          this.generatedSalaryMonths = res;
        }
      });
  }

  checkPendingTempSalary(): void {
    this.financeService
      .getPendingTempSalary(this.companyId)
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.pendingTempSalary =
              this.getFormattedMonth(res.salaryMonth,res.salaryYear);
          }
        }
      });
  }

  getMonthName(month: number): string {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames[month - 1];
  }

  getFormattedMonth(month: number, year: number): string {
    return `${this.getMonthName(month)} ${year}`;
  }

toggleSelectAll(event: any): void {
  const checked = event.target.checked;
  this.allSalaryEmployeesSelected = checked;
  this.salaryReport.forEach((salary: any) => {
    salary.isSelected = checked;
  });
}
updateSelectAllState(): void {
  this.allSalaryEmployeesSelected =
    this.salaryReport.length > 0 &&
    this.salaryReport.every((salary: any) => salary.isSelected);
}

approveSelectedEmployees(): void {
  this.selectedEmployees = this.salaryReport.filter(
    (employee: any) => employee.isSelected
  );

  if (!this.selectedEmployees.length) {
    this.toastService.warning(
      'Please select at least one employee'
    );
    return;
  }

  const payload = {
    companyId: this.companyId,
    salaryIds: this.selectedEmployees.map(
      (employee: any) => employee.id
    ),
    salaryMonth: this.salaryMonth,
    salaryYear: this.salaryYear,
    approveAll: this.allSalaryEmployeesSelected
  };

  this.popup.open(payload);
}  
onApprovalConfirmed(payload: any): void {
  this.financeService.approveSelectedEmployeesSalary(payload)
    .subscribe({
      next: (res: any) => {
        this.toastService.success(
          res?.message || 'Salary approved successfully'
        );

        this.loadSalaryReport();
      },

      error: (err: any) => {
        this.toastService.error(
          err?.error?.message || 'Error approving salary'
        );
      }
    });
}

onPopupClose(): void {

}
confirmSalary(): void {
  const isConfirmed = window.confirm(
    'Are you sure you want to confirm salary?'
  );

  if (isConfirmed) {
    // YES / OK clicked
    this.saveConfirmedSalary();
  } else {
    // NO / Cancel clicked
    return;

  }
}
saveConfirmedSalary(): void {
  const payload = {
    companyId: this.companyId,
    salaryMonth: this.salaryMonth,
    salaryYear: this.salaryYear
  };
  this.financeService.confirmSalary(payload).subscribe({
    next: (res: any) => {
      this.toastService.success(res?.message || 'Salary confirmed successfully');
      this.loadSalaryReport();
    },
    error: (err: any) => {
      this.toastService.error(
        err?.error?.message || 'Error confirming salary'
      );
    }
  });
}
hasSalaryData(): boolean {
  return this.salaryReport && this.salaryReport.length > 0;
}

hasGeneratedSalary(): boolean {
  return this.salaryReport?.some(
    (salary: any) => salary.status === 'Generated'
  );
}

hasApprovedSalary(): boolean {
  return this.salaryReport?.some(
    (salary: any) => salary.status === 'Approved'
  );
}

/**
 * 1. TEMP + No salary generated
 * Show Generate button
 */
canGenerateSalary(): boolean {
  return (!this.hasSalaryData());
}

/**
 * 2. TEMP + Generated records available
 * Show Approve & Delete buttons
 */
canApproveSalary(): boolean {
  return (this.hasGeneratedSalary());
}

canDeleteSalary(): boolean {
  return (this.hasGeneratedSalary());
}

/**
 * 3. Any one Approved record
 * Show Confirm button
 */
canConfirmSalary(): boolean {
  return this.hasApprovedSalary();
}
onSalaryViewTypeChange(event: any): void {  
  this.loadSalaryReport();
}
}
