import { Component, OnInit } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TransactionStatus, VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-voucher-report',
  providers: [DateUtcPipe],
  imports: [CommonModule,TableModule,FormsModule],
  templateUrl: './voucher-report.component.html',
  styleUrl: './voucher-report.component.scss'
})
export class VoucherReportComponent implements OnInit {
 companyId: any;

  fromDate = new Date();
  toDate = new Date();

  voucherType: VoucherType | null = null;
  status: TransactionStatus | null = null;

  voucherTypes = Object.keys(VoucherType)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: VoucherType[key as keyof typeof VoucherType]
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
  }

  searchVoucherReport() {
    const request = {
      companyId: this.companyId,
      fromDate: this.dateUtcPipe.transform(this.fromDate,'withCurrentTime'),
      toDate: this.dateUtcPipe.transform(this.toDate, 'withCurrentTime'),
      voucherType: this.voucherType,
      status: this.status
    };

    this.financeService.getVoucherReport(request)
      .subscribe(res => {
        this.voucherReports = res;
      });
  }  
  

}
