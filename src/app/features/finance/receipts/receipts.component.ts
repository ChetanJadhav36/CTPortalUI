import { Component } from '@angular/core';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { FinanceService } from '../../../services/finance.service';

@Component({
  selector: 'app-receipts',
 imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './receipts.component.html',
  styleUrl: './receipts.component.scss'
})
export class ReceiptsComponent {
companyId: any;
receipts: any = [];

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
    this.financeService.getReceiptsByCompanyId(this.companyId).subscribe(
      (res: any[]) => 
        this.receipts = res
    );
  }

  onAddNewReceipt() {
    this.router.navigate(['finance/receipt/add']);
  }

  onEdit(id: any) {
    this.router.navigate([`finance/receipt/edit/${id}`]);
  }
}
