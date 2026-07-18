import { Component, Injector, ViewChild } from '@angular/core';
import { PaymentType } from '../../../enums/permission.enum';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { ApprovalConfirmationPopUpComponent } from '../approval-confirmation-pop-up/approval-confirmation-pop-up.component';

@Component({
  selector: 'app-financial-entry-approval',
  standalone: true,
  imports: [CommonModule,IconDirective,TableModule,ApprovalConfirmationPopUpComponent ],
  templateUrl: './financial-entry-approval.component.html',
  styleUrl: './financial-entry-approval.component.scss'
})
export class FinancialEntryApprovalComponent {
companyId: any;
transactions: any = [];
approvedTransactionData: any = null;
// Expose enum
PaymentType = PaymentType;

 @ViewChild(ApprovalConfirmationPopUpComponent)
popup!: ApprovalConfirmationPopUpComponent;
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
  this.getTransactions();
}
// Fetch Transactions
getTransactions() {
  this.financeService.getTransactionsByCompanyId(this.companyId).subscribe(
    (res: any[]) => {
      this.transactions = res;
      console.log('Fetched transactions:', this.transactions);
    },
    (error:any) => {
      console.error('Error fetching transactions:', error);
    }
  );
}
openPopup(data: any) {
  data.companyId = this.companyId; // Ensure companyId is included
    this.popup.open(data);    
}
onPopupClose() {
  this.getTransactions();
}
}
