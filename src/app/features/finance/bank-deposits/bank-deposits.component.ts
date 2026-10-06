import { Component, ViewEncapsulation } from '@angular/core';
import { BankDepositType, PaymentType, VoucherType } from '../../../enums/permission.enum';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-bank-deposits',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './bank-deposits.component.html',
  styleUrl: './bank-deposits.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BankDepositsComponent {
  companyId: any;
  deposits: any = [];

  PaymentType = PaymentType;

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

  ngOnInit() {
    this.getDeposits();
  }

  // Fetch Deposits
  getDeposits() {
    let transactionData = { companyId: this.companyId, voucherType: BankDepositType.BDEP }; // Ensure voucherType is set to BDEP
    this.financeService.getBankDepositsByCompanyId(transactionData).subscribe(
      (res: any[]) => {
        this.deposits = res;
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  // Add Deposit
  onAddNewDeposit() {
    this.router.navigate(['finance/bank-deposit/add']);
  }

  // Edit Deposit
  onEditDeposit(id: any) {
    this.router.navigate([`finance/bank-deposit/edit/${id}`]);
  }
}
