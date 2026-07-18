import { Routes } from '@angular/router';
import { PermissionAction } from '../../enums/permission.enum';
import { roleGuard } from '../../services/role.guard';

export const FINANCE_ROUTES: Routes = [
    {
    path: 'receipts',
    loadComponent: () => import('./receipts/receipts.component').then(m => m.ReceiptsComponent),
    data: {
      title: 'Receipts'
    }
  },
  {
    path: 'receipt/add',
    loadComponent: () => import('./receipt/receipt.component').then(m => m.ReceiptComponent),
    data: {
      title: 'Receipt Add'
    }
  },
  {
    path: 'receipt/edit/:id',
    loadComponent: () => import('./receipt/receipt.component').then(m => m.ReceiptComponent),
    data: {
      title: 'Receipt Edit'
    }
  },
  {
    path: 'expenses',
    loadComponent: () => import('./expenses/expenses.component').then(m => m.ExpensesComponent),
    data: {
      title: 'Expenses'
    }
},
{
    path: 'expense/add',
    loadComponent: () => import('./expense/expense.component').then(m => m.ExpenseComponent),
    data: {
      title: 'Expense Add'
    }
},
{
    path: 'expense/edit/:id',
    loadComponent: () => import('./expense/expense.component').then(m => m.ExpenseComponent),
    data: {
      title: 'Expense Edit'
    }
},
 {
    path: 'financial-entry-approval',
    loadComponent: () => import('./financial-entry-approval/financial-entry-approval.component').then(m => m.FinancialEntryApprovalComponent),
    canActivate: [roleGuard],
    data: {
          roles: ['Admin'],
          page: 'FEA',
          action: PermissionAction.View
    }
},
{
    path: 'bank-deposits',
    loadComponent: () => import('./bank-deposits/bank-deposits.component').then(m => m.BankDepositsComponent),
    data: {
      title: 'Deposits'
    }
},
{
    path: 'bank-deposit/add',
    loadComponent: () => import('./bank-deposit/bank-deposit.component').then(m => m.BankDepositComponent),
    data: {
      title: 'Deposit Add'
    }
},
{
    path: 'bank-deposit/edit/:id',
    loadComponent: () => import('./bank-deposit/bank-deposit.component').then(m => m.BankDepositComponent),
    data: {
      title: 'Deposit Edit'
    }
},
{
    path: 'employee-advances',
    loadComponent: () => import('./employee-advances/employee-advances.component').then(m => m.EmployeeAdvancesComponent),
    data: {
      title: 'Employee Advances'
    }
},
{
    path: 'employee-advance/add',
    loadComponent: () => import('./employee-advance/employee-advance.component').then(m => m.EmployeeAdvanceComponent),
    data: {
      title: 'Employee Advance Add'
    }
},
{
    path: 'employee-advance/edit/:id',
    loadComponent: () => import('./employee-advance/employee-advance.component').then(m => m.EmployeeAdvanceComponent),
    data: {
      title: 'Employee Advance Edit'
    }
},
{
    path: 'journal-vouchers',
    loadComponent: () => import('./journal-vouchers/journal-vouchers.component').then(m => m.JournalVouchersComponent),
    data: {
      title: 'Journal Vouchers'
    }
},
{
    path: 'journal-voucher/add',
    loadComponent: () => import('./journal-voucher/journal-voucher.component').then(m => m.JournalVoucherComponent),
    data: {
      title: 'Journal Voucher'
    }
},
{
    path: 'journal-voucher/edit/:id',
    loadComponent: () => import('./journal-voucher/journal-voucher.component').then(m => m.JournalVoucherComponent),
    data: {
      title: 'Journal Edit'
    }
},
{
    path: 'ledger-report',
    loadComponent: () => import('./ledger-report/ledger-report.component').then(m => m.LedgerReportComponent),
    data: {
      title: 'Ledger Report'
    }
},
{
    path: 'voucher-report',
    loadComponent: () => import('./voucher-report/voucher-report.component').then(m => m.VoucherReportComponent),
    data: {
      title: 'Voucher Report'
    }
},
];