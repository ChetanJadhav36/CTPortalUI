import { Component, OnInit, ViewChild } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TransactionStatus, VoucherReportType, VoucherType } from '../../../enums/permission.enum';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-voucher-report',
  providers: [DateUtcPipe],
  imports: [CommonModule,TableModule,FormsModule ],
  templateUrl: './voucher-report.component.html',
  styleUrl: './voucher-report.component.scss'
})
export class VoucherReportComponent implements OnInit {
 companyId: any;

  fromDate: string = '';
  toDate: string = '';
  voucherReportType: VoucherReportType | null = null;
  
  status: TransactionStatus | null = null;  
cols = [
    { field: 'serialNumber', header: 'SR' },
    { field: 'voucherDate', header: 'Date' },
    { field: 'voucherNumber', header: 'Voucher No' },
    { field: 'voucherType', header: 'Voucher Type' },
    { field: 'status', header: 'Status' },
    { field: 'paymentType', header: 'Payment Type' },
    { field: 'sourceAccount', header: 'Source Account' },
    { field: 'destinationAccount', header: 'Destination' },
    { field: 'amount', header: 'Amount' },

    { field: 'notes2000', header: '₹2000' },
    { field: 'notes500', header: '₹500' },
    { field: 'notes200', header: '₹200' },
    { field: 'notes100', header: '₹100' },
    { field: 'notes50', header: '₹50' },
    { field: 'notes20', header: '₹20' },
    { field: 'notes10', header: '₹10' },
    { field: 'notes5', header: '₹5' },
    { field: 'coins', header: 'Coins' },

    { field: 'narration', header: 'Narration' },
    { field: 'bankName', header: 'Bank' },
    { field: 'chequeNumber', header: 'Cheque No' },
    { field: 'remark', header: 'Remark' },

    { field: 'createdBy', header: 'Created By' },
    { field: 'createdDate', header: 'Created Date' },

    { field: 'approvedBy', header: 'Approved By' },
    { field: 'approvedDate', header: 'Approved Date' },

    { field: 'paidBy', header: 'Paid By' },
    { field: 'paidDate', header: 'Paid Date' }
  ];
  voucherTypes = Object.keys(VoucherReportType)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: VoucherReportType[key as keyof typeof VoucherReportType]
    }));

  statusList = Object.keys(TransactionStatus)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: TransactionStatus[key as keyof typeof TransactionStatus]
    }));

  voucherReports: any[] = []; 

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private dateUtcPipe: DateUtcPipe
  ) {    
    const auth = this.authService.getUserAuthData();

    if (auth) {
      this.companyId = auth.client.clientId;
    }
  }

  ngOnInit(): void {
    this.fromDate = this.dateUtcPipe.transform(new Date(), 'input') ?? '';
    this.toDate = this.dateUtcPipe.transform(new Date(), 'input') ?? '';
  }

  searchVoucherReport() {
    const request = {
      companyId: this.companyId,
      fromDate: this.dateUtcPipe.transform(this.fromDate,'withCurrentTime'),
      toDate: this.dateUtcPipe.transform(this.toDate, 'withCurrentTime'),
      voucherReportType: this.voucherReportType,
      status: this.status
    };

    this.financeService.getVoucherReport(request)
      .subscribe(res => {
        this.voucherReports = res;
      });
  }  
  /**
   * Common data preparation for Excel and CSV
   */
  private getExportData(): any[] {
    return this.voucherReports.map((row, index) => ({
      'SR': index + 1,
      'Date': this.formatDate(row.voucherDate),
      'Voucher No': row.voucherNumber ?? '',
      'Voucher Type': row.voucherType ?? '',
      'Status': row.status ?? '',
      'Payment Type': row.paymentType ?? '',
      'Source Account': row.sourceAccount ?? '',
      'Destination': row.destinationAccount ?? '',

      'Amount': row.amount ?? 0,
      // Cash Notes
      '₹2000': row.cashNotes?.notes2000 ?? 0,
      '₹500': row.cashNotes?.notes500 ?? 0,
      '₹200': row.cashNotes?.notes200 ?? 0,
      '₹100': row.cashNotes?.notes100 ?? 0,
      '₹50': row.cashNotes?.notes50 ?? 0,
      '₹20': row.cashNotes?.notes20 ?? 0,
      '₹10': row.cashNotes?.notes10 ?? 0,
      '₹5': row.cashNotes?.notes5 ?? 0,
      'Coins': row.cashNotes?.coins ?? 0,

      'Narration': row.narration ?? '',
      'Bank': row.bankName ?? '',
      'Cheque No': row.chequeNumber ?? '',
      'Remark': row.remark ?? '',
      'Created By': row.createdBy ?? '',
      'Created Date': this.formatDate(row.createdDate),
      'Approved By': row.approvedBy ?? '',
      'Approved Date': this.formatDate(row.approvedDate),
      'Paid By': row.paidBy ?? '',
      'Paid Date': this.formatDate(row.paidDate)
    }));
  }

  /**
   * Export Excel
   */
  ExportExcel(): void {

    if (!this.voucherReports?.length) {
      return;
    }

    const excelData = this.getExportData();

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(excelData);

    // Auto column width
    worksheet['!cols'] = Object.keys(excelData[0]).map(key => {

      const maxLength = Math.max(
        key.length,
        ...excelData.map(row =>
          String(
            row[key] ?? ''
          ).length
        )
      );

      return {
        wch: Math.min(
          Math.max(maxLength + 2, 10),
          35
        )
      };
    });

    const workbook: XLSX.WorkBook = {
      Sheets: {
        'Voucher Report': worksheet
      },
      SheetNames: [
        'Voucher Report'
      ]
    };

    const excelBuffer: ArrayBuffer = XLSX.write(
      workbook,
      {
        bookType: 'xlsx',
        type: 'array'
      }
    );

    this.saveAsExcelFile(
      excelBuffer,
      'Voucher_Report'
    );
  }

  /**
   * Export CSV
   */
  exportCSV(): void {

    if (!this.voucherReports?.length) {
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

    const csvContent =
      '\ufeff' +
      headers.join(',') +
      '\r\n' +
      csvRows.join('\r\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    saveAs(
      blob,
      `Voucher_Report_${new Date().getTime()}.csv`
    );
  }

  /**
   * Escape CSV values
   */
  private escapeCsvValue(value: any): string {
    if (
      value === null ||
      value === undefined
    ) {
      return '""';
    }

    const stringValue = String(value);

    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  /**
   * Save Excel file
   */
  private saveAsExcelFile(
    buffer: ArrayBuffer,
    fileName: string
  ): void {

    const data: Blob = new Blob(
      [buffer],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      }
    );

    saveAs(
      data,
      `${fileName}_${new Date().getTime()}.xlsx`
    );
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

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
