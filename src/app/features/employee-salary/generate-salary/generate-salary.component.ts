import { Component, ViewChild } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SalaryApprovalConfirmationPopUpComponent } from '../salary-approval-confirmation-pop-up/salary-approval-confirmation-pop-up.component';
import { ToastService } from '../../../services/toast.service';
import { SalaryAdjustmentPopUpComponent } from '../salary-adjustment-pop-up/salary-adjustment-pop-up.component';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-generate-salary',
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule,TableModule,TooltipModule,SalaryApprovalConfirmationPopUpComponent,SalaryAdjustmentPopUpComponent,IconDirective],
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

  @ViewChild(SalaryAdjustmentPopUpComponent)
  salaryAdjustmentPopUp!: SalaryAdjustmentPopUpComponent;

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
      otherAdditionalAmount: 0,
      otherDeductionAmount: 0,      
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
    (salary: any) => salary.status === 'Draft'
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

onSalaryViewTypeChange(event: any): void {  
  this.loadSalaryReport();
}
openSalaryAdjustmentPopup(salary: any): void {
  if (salary.status !== 'Draft') {
    this.toastService.warning('Salary adjustment is allowed only for Draft salary.');
    return;
  }
  this.salaryAdjustmentPopUp.open(salary);
}
onSalaryAdjustmentSubmitted(payload: any): void {
  const request = {
    companyId: this.companyId,
    tempSalaryId: payload.tempSalaryId,
    employeeId: payload.employeeId,
    otherDeductionAmount: payload.otherDeductionAmount,
    otherDeductionAmtRemark: payload.otherDeductionAmtRemark,
    otherAdditionalAmount: payload.otherAdditionalAmount,
    otherAdditionalAmtRemark: payload.otherAdditionalAmtRemark
  };
  this.financeService.updateTempSalary(request)
    .subscribe({
      next: (res: any) => {
        this.toastService.success(res?.message || 'Salary adjustment updated successfully.');
        this.loadSalaryReport();
      },
      error: (err: any) => {
        this.toastService.error(err?.error?.message || 'Error updating salary adjustment.');
      }
    });
}
onSalaryAdjustmentPopupClose(): void {
}
}
