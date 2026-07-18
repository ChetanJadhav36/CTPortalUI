import { Component } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-journal-vouchers',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './journal-vouchers.component.html',
  styleUrl: './journal-vouchers.component.scss'
})
export class JournalVouchersComponent {
  companyId: any;
  journalVouchers: any[] = [];

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private router: Router
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit(): void {
    this.getJournalVouchers();
  }

  getJournalVouchers() {
    const transactionData = {
      companyId: this.companyId
    };

    this.financeService.getJournalVouchersByCompanyId(transactionData)
      .subscribe({
        next: (res: any[]) => {
          this.journalVouchers = res;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  onAddNewJournalVoucher() {
    this.router.navigate(['finance/journal-voucher/add']);
  }

  onEditJournalVoucher(id: number) {
    this.router.navigate([`finance/journal-voucher/edit/${id}`]);
  } 
}
