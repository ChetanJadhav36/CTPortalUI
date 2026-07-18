import { Component } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '@coreui/angular';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { TableModule } from 'primeng/table';
import { IconDirective } from '@coreui/icons-angular';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-pay-salaries',
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule,TableModule ,TooltipModule,IconDirective,TooltipModule],
  templateUrl: './pay-salaries.component.html',
  styleUrl: './pay-salaries.component.scss'
})
export class PaySalariesComponent {
  companyId: any;
  approvedSalaries: any[] = []; 

  // Filters
  salaryMonth: number = new Date().getMonth(); // Default to previous month
  salaryYear: number = new Date().getFullYear();

  months = [
    { id: 1, name: 'Jan' },
    { id: 2, name: 'Feb' },
    { id: 3, name: 'Mar' },
    { id: 4, name: 'Apr' },
    { id: 5, name: 'May' },
    { id: 6, name: 'Jun' },
    { id: 7, name: 'Jul' },
    { id: 8, name: 'Aug' },
    { id: 9, name: 'Sep' },
    { id: 10, name: 'Oct' },
    { id: 11, name: 'Nov' },
    { id: 12, name: 'Dec' }
  ];

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {

    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit(): void {
    this.getConfirmedSalaries();
  }
  
  // Get Confirmed Salaries  
  getConfirmedSalaries() {
    const requestData = {
      companyId: this.companyId,
      salaryMonth: this.salaryMonth,
      salaryYear: this.salaryYear
    };

    this.financeService.getConfirmedSalariesByCompanyId(requestData)
      .subscribe((res: any[]) => {        
          this.approvedSalaries = res;
          if (this.approvedSalaries.length > 0) {
            // Set default filters to the month and year of the first salary in the list
            this.salaryMonth = this.approvedSalaries[0].salaryMonth;
            this.salaryYear = this.approvedSalaries[0].salaryYear;
            this.toastService.success('Confirmed salaries loaded successfully');
          }
          if(this.approvedSalaries.length == 0) {
            this.toastService.warning('No confirmed salaries found. Please generate and approve salaries first.');
          }
        },
        (error) => {
          this.toastService.error('Error loading approved salaries.');
          console.log(error);
        }
      );
  } 

  // Pay Salary
onPaySalary(salary: any) {
  this.router.navigate([`employee-salary/pay-salary/pay`,salary.id,salary.employeeId]);
}
  loadApprovedSalariesByMonthYear() {
    const requestData = {
      companyId: this.companyId,
      salaryMonth: this.salaryMonth,
      salaryYear: this.salaryYear
    };
    this.financeService.getConfirmedSalariesByCompanyId(requestData).subscribe(
      (res: any[]) => {
        this.approvedSalaries = res;
          if (this.approvedSalaries.length > 0) {
            // Set default filters to the month and year of the first salary in the list
            this.salaryMonth = this.approvedSalaries[0].salaryMonth;
            this.salaryYear = this.approvedSalaries[0].salaryYear;
            this.toastService.success('Confirmed salaries loaded successfully');
          }
          if(this.approvedSalaries.length == 0) {
            this.toastService.warning('No approved salaries found. Please generate and approve salaries first.');
          }
      },
      (error) => {
        this.toastService.error('Error loading approved salaries.');
        console.log(error);
      }
    );
  }

  // Get Month Name
  getMonthName(monthId: number): string {
    const month = this.months.find(x => x.id == monthId);
    return month ? month.name : '';
  }  
}
