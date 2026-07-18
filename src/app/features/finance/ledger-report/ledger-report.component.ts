import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { EmployeesService } from '../../../services/employees.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';

@Component({
  selector: 'app-ledger-report',
  providers: [DateUtcPipe],
  imports: [CommonModule,TableModule,FormsModule],
  templateUrl: './ledger-report.component.html',
  styleUrl: './ledger-report.component.scss'
})
export class LedgerReportComponent implements OnInit {
  companyId: any;

  ledgerTypes = [
    { label: 'Account Ledger', value: 'ACCOUNT' },
    { label: 'Employee Ledger', value: 'EMPLOYEE' }
  ];

  selectedLedgerType = 'ACCOUNT';

  accounts: any[] = [];
  employees: any[] = [];
  employeeId: number | null = null;
  employeeFullName = '';

  accountId: number | null = null; 

  fromDate = new Date();
  toDate = new Date();

  ledger: any;

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private masterService: MasterService,
    private employeesService: EmployeesService,
    private dateUtcPipe: DateUtcPipe,
    private toastService:ToastService
  ) {
      const authData = this.authService.getUserAuthData();
      if (authData && authData.userId) {
        this.companyId = authData.client?.clientId;
      }
  }

  ngOnInit(): void {
    this.loadAccounts();    
  }
onLedgerTypeChange() {

  this.accountId = null;

  this.employeeId = null;
  this.employeeFullName = '';
  this.employees = [];

}
loadAccounts() {
  this.masterService.getAccountsByCompanyId(this.companyId)
    .subscribe(res => {
      this.accounts = res;
    });
}
onAccountChange(): void {    
}

searchEmployee(event: any) {
  const keyword = event.target.value;

  // Clear previously selected employee
  this.employeeId = null;

  if (keyword.length <= 1) {
    this.employees = [];
    return;
  }

  this.employeesService
    .searchEmployeeAdvancePayment(keyword, this.companyId)
    .subscribe(
      res => this.employees = res,
      err => this.toastService.error(err?.error?.message || 'Error fetching employees')
    );
}
selectEmployee(employee: any) {
  this.employeeId = employee.employeeId;
  this.employeeFullName = employee.employeeFullName;
  this.employees = [];
}

searchLedger() {
    const request = {
      companyId: this.companyId,      
      fromDate: this.dateUtcPipe.transform(this.fromDate, 'withCurrentTime'),
      toDate: this.dateUtcPipe.transform(this.toDate, 'withCurrentTime'),
      accountId: this.selectedLedgerType == 'ACCOUNT' ? this.accountId : null,
      employeeId: this.selectedLedgerType == 'EMPLOYEE' ? this.employeeId : null
    };

    this.financeService.getLedgerReport(request)
      .subscribe(res => {
        this.ledger = res;
      });
}
}
