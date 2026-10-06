import { Component } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { PaymentType, VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-employee-advances',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './employee-advances.component.html',
  styleUrl: './employee-advances.component.scss'
})
export class EmployeeAdvancesComponent {
companyId: any;
employeeAdvances: any = [];
// Expose the enum to the template
PaymentType = PaymentType;  // <-- THIS IS CRUCIAL

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
  this.getEmployeeAdvances();
}

// Fetch Employee Advances
getEmployeeAdvances() {
  let transactionData = { companyId: this.companyId, voucherType: VoucherType.EADV }; // Ensure voucherType is set to EADV
  this.financeService.getEmployeeAdvancesByCompanyId(transactionData).subscribe(
    (res: any[]) => {
      this.employeeAdvances = res;            
    },
    (error) => {      
    }
  );
}

// Add Expense
onAddNewExpense() {
  this.router.navigate(['finance/employee-advance/add']);
}

// Edit Expense
onEditExpense(id: any) {
  this.router.navigate([`finance/employee-advance/edit/${id}`]);
}
}
