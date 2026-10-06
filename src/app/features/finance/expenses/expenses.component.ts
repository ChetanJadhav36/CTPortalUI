import { Component } from '@angular/core';
import { FinanceService } from '../../../services/finance.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { ExpenseType, PaymentType, VoucherType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
companyId: any;
expenses: any = [];
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
  this.getExpenses();
}

// Fetch Expenses
getExpenses() {
  let transactionData = { companyId: this.companyId, voucherType: ExpenseType.EXP };
  this.financeService.getExpensesByCompanyId(transactionData).subscribe(
    (res: any[]) => {
      this.expenses = res;      
    },
    (error) => {      
    }
  );
}

// Add Expense
onAddNewExpense() {
  this.router.navigate(['finance/expense/add']);
}

// Edit Expense
onEditExpense(id: any) {
  this.router.navigate([`finance/expense/edit/${id}`]);
}

}
