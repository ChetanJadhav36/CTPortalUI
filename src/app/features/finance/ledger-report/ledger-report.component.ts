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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  selectedEmployeeIndex: number = -1;
  accountId: number | null = null; 
  fromDate: string = '';
  toDate: string = '';
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
    this.fromDate = this.dateUtcPipe.transform(new Date(), 'input') ?? '';
    this.toDate = this.dateUtcPipe.transform(new Date(), 'input') ?? '';
    this.loadAccounts();    
  }

  onLedgerTypeChange(): void {
  this.accountId = null;

  this.employeeId = null;
  this.employeeFullName = '';
  this.employees = [];
  this.selectedEmployeeIndex = -1;
  }

  loadAccounts() {
    this.masterService.getAccountsByCompanyId(this.companyId)
      .subscribe(res => {
        this.accounts = res;
      });
  }
  onAccountChange(): void {    
  }
  searchEmployee(event: any): void {
  const keyword = event.target.value?.trim() || '';

  // Clear previously selected employee
  this.employeeId = null;

  if (keyword.length <= 1) {
    this.employees = [];
    this.selectedEmployeeIndex = -1;
    return;
  }

  this.employeesService
    .searchEmployeeAdvancePayment(keyword, this.companyId)
    .subscribe({
      next: (response: any[]) => {
        this.employees = response || [];
        this.selectedEmployeeIndex = -1;
      },
      error: (error: any) => {
        this.employees = [];
        this.selectedEmployeeIndex = -1;

        this.toastService.error(
          error?.error?.message || 'Error fetching employees'
        );
      }
    });
  }
  onEmployeeKeydown(event: KeyboardEvent): void {
  if (!this.employees || this.employees.length === 0) {
    return;
  }

  // Arrow Down
  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (this.selectedEmployeeIndex < this.employees.length - 1) {
      this.selectedEmployeeIndex++;
    } else {
      this.selectedEmployeeIndex = 0;
    }
  }

  // Arrow Up
  else if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (this.selectedEmployeeIndex > 0) {
      this.selectedEmployeeIndex--;
    } else {
      this.selectedEmployeeIndex = this.employees.length - 1;
    }
  }

  // Enter
  else if (event.key === 'Enter') {
    event.preventDefault();

    if (
      this.selectedEmployeeIndex >= 0 &&
      this.selectedEmployeeIndex < this.employees.length
    ) {
      this.selectEmployee(
        this.employees[this.selectedEmployeeIndex]
      );
    }
  }

  // Escape
  else if (event.key === 'Escape') {
    event.preventDefault();

    this.employees = [];
    this.selectedEmployeeIndex = -1;
  }
  }
  selectEmployee(employee: any): void {
  this.employeeId = employee.employeeId;
  this.employeeFullName = employee.employeeFullName;

  this.employees = [];
  this.selectedEmployeeIndex = -1;
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
  /**
 * Common data preparation for Excel and CSV
 */
  private getExportData(): any[] {

    if (!this.ledger?.transactions?.length) {
      return [];
    }

    return this.ledger.transactions.map((row: any, index: number) => ({
      'SR': index + 1,
      'Date': this.formatDate(row.date),
      'Voucher No': row.voucherNo ?? '',
      'Type': row.voucherType ?? '',
      'Particular': row.particular ?? '',
      'Dr. Amt': row.debit ?? 0,
      'Cr. Amt': row.credit ?? 0,
      'Net Balance': row.balance ?? 0,
      'Narration': row.narration ?? ''
    }));
  }
  /**
 * Export Ledger to Excel
 */
  ExportExcel(): void {

  if (!this.ledger?.transactions?.length) {
    return;
  }
  const transactionData = this.getExportData();
  const summaryData = [
    {
      'Ledger Type': this.selectedLedgerType === 'ACCOUNT'
        ? 'Account Ledger'
        : 'Employee Ledger',

      'From Date': this.formatDate(this.fromDate),
      'To Date': this.formatDate(this.toDate),

      'Total Debit': this.ledger.totalDebit ?? 0,
      'Total Credit': this.ledger.totalCredit ?? 0,
      'Closing Balance': this.ledger.closingBalance ?? 0
    }
  ];

  const worksheet: XLSX.WorkSheet = {};
  // Add summary
  XLSX.utils.sheet_add_json(worksheet, summaryData,{ origin: 'A1'});

  // Add blank row + transactions
  XLSX.utils.sheet_add_json( worksheet, transactionData, {origin: 'A4'});

  // Auto column width
  worksheet['!cols'] = Object.keys(transactionData[0]).map(key => {
      const maxLength = Math.max( key.length, ...transactionData.map(row =>
          String(row[key] ?? '').length));
      return {
        wch: Math.min(
          Math.max(maxLength + 2, 10),
          35
        )
      };
    });

  const workbook: XLSX.WorkBook = {
    Sheets: {'Ledger Report': worksheet },    
    SheetNames: ['Ledger Report'] };

  const excelBuffer: ArrayBuffer =
    XLSX.write( workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile( excelBuffer, 'Ledger_Report');}

  /**
   * Export Ledger to CSV
   */
  exportCSV(): void {
    if (!this.ledger?.transactions?.length) {
      return;
    }

    const csvData = this.getExportData();
    const headers = Object.keys(csvData[0]);
    const csvRows = csvData.map(row => {

      return headers
        .map(header =>
          this.escapeCsvValue(row[header])
        )
        .join(',');
    });

    const csvContent = '\ufeff' + headers.join(',') + '\r\n' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;'});

    saveAs(blob, `Ledger_Report_${new Date().getTime()}.csv`);
  }
  /**
 * Escape CSV values
 */
  private escapeCsvValue(value: any): string {
    if ( value === null || value === undefined) {
      return '""';
    }
    const stringValue = String(value);

    return `"${stringValue.replace(/"/g, '""')}"`;
  }
/**
 * Save Excel file
 */
  private saveAsExcelFile(buffer: ArrayBuffer, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }
/**
 * Format date as dd/MM/yyyy
 */
  private formatDate(value: any): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
