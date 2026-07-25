import { Injectable } from '@angular/core';
import { INavData } from '@coreui/angular';
import { PermissionAction } from '../../enums/permission.enum';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  getNavItems(): AppNavData[] {
  return [
    {
      name: 'Dashboard',
      url: '/dashboard',
      iconComponent: { name: 'cil-speedometer' },
      roles: ['Admin', 'User'],
      page: 'DB',
      action: PermissionAction.View
    },
    {
      name: 'Companies',
      url: '/company/companies',
      iconComponent: { name: 'cil-basket' },
      roles: ['SuperAdmin']      
    },
    {
      name: 'Company Users',
      url: '/user-permissions/company-users-list',
      iconComponent: { name: 'cil-user' },
      roles: ['Admin', 'User'],
      page: 'CU',
      action: PermissionAction.View
    },
    {
      name: 'Page Management',
      url: '/user-permissions/pages',
      iconComponent: { name: 'cil-layers' },
      roles: ['SuperAdmin']
    },
    {
      name: 'ADMINISTRATION',
      title: true,
      roles: ['Admin', 'User'],
    },
    {
      name: 'Account Groups',
      url: 'masters/account-groups',
      iconComponent: { name: 'cil-layers' },
      roles: ['Admin', 'User'],
      page: 'AG',
      action: PermissionAction.View
    },
    {
      name: 'Accounts',
      url: 'masters/accounts',
      iconComponent: { name: 'cil-description' },
      roles: ['Admin', 'User'],
      page: 'ACC',
      action: PermissionAction.View
    },
    {
      name: 'Employees',
      url: 'employees/employee-list',
      iconComponent: { name: 'cil-user-follow' },
      roles: ['Admin', 'User'],
      page: 'EMP',
      action: PermissionAction.View
    },
    {
      name: 'FINANCE',
      title: true,
      roles: ['Admin', 'User'],
    },
    {
      name: 'Approvals',
      url: 'finance/financial-entry-approval',
      iconComponent: { name: 'cil-description' },
      roles: ['Admin', 'User'],
      page: 'FEA',
      action: PermissionAction.View
    },
    {
      name: 'Customer Orders',
      url: 'tailoring/customer-orders',
      iconComponent: { name: 'cil-description' },
      roles: ['Admin', 'User'],
      page: 'CO',
      action: PermissionAction.View
    },
    {
      name: 'Receipts',
      url: 'finance/receipts',
      iconComponent: { name: 'cil-description' },
      roles: ['Admin', 'User'],
      page: 'REC',
      action: PermissionAction.View
    },
    {
      name: 'Expenses',
      url: 'finance/expenses',
      iconComponent: { name: 'cil-basket' },
      roles: ['Admin', 'User'],
      page: 'EXP',
      action: PermissionAction.View
    },
    {
      name: 'Employee Advance',
      url: 'finance/employee-advances',
      iconComponent: { name: 'cil-dollar' },
      roles: ['Admin', 'User'],
      page: 'EA',
      action: PermissionAction.View
    },
    {
      name: 'Bank Deposits',
      url: 'finance/bank-deposits',
      iconComponent: { name: 'cil-dollar' },
      roles: ['Admin', 'User'],
      page: 'BD',
      action: PermissionAction.View
    },
    {
      name: 'Journal Voucher',
      url: 'finance/journal-vouchers',
      iconComponent: { name: 'cil-dollar' },
      roles: ['Admin', 'User'],
      page: 'JV',
      action: PermissionAction.View
    },
    {
      name: 'HR',
      title: true,
      roles: ['Admin', 'User'],
    },
    {
      name: 'Attendance',
      url: 'employee-attendance/attendance-list',
      iconComponent: { name: 'cil-check' },
      roles: ['Admin', 'User'],
      page: 'ATT',
      action: PermissionAction.View
    },
    {
      name: 'Salary Management',
      url: 'employee-salary/generate-salary',
      iconComponent: { name: 'cil-dollar' },
      roles: ['Admin', 'User'],
      page: 'SAL',
      action: PermissionAction.View
    },
    {
      name: 'Pay Salaries',
      url: 'employee-salary/pay-salaries',
      iconComponent: { name: 'cil-check' },
      roles: ['Admin', 'User'],
      page: 'PS',
      action: PermissionAction.View
    },
    {
      name: 'Reports',
      title: true,
      roles: ['Admin', 'User'],
    },
    {
      name: 'Ledger Report',
      url: 'finance/ledger-report',
      iconComponent: { name: 'cil-layers' },
      roles: ['Admin', 'User'],
      page: 'LR',
      action: PermissionAction.View
    },
    {
      name: 'Voucher Report',
      url: 'finance/voucher-report',
      iconComponent: { name: 'cil-layers' },
      roles: ['Admin', 'User'],
      page: 'VR',
      action: PermissionAction.View
    }
  ];
}
}
export interface AppNavData extends INavData {
  roles?: string[];
  page?: string;
  action?: PermissionAction;
}