import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
    {
    path: 'employee-list',
    loadComponent: () => import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent),
    data: {
      title: 'Employee List'
    }
  },
    {
    path: 'employee-form',
    loadComponent: () => import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    data: {
      title: 'Employee Form'
    }
  },
  {
    path: 'employee-form/:id',
    loadComponent: () => import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    data: {
      title: 'Employee Form Edit'
    }
  },
  {
  path: 'employee-contact-form/:employeeId/contact/add',
  loadComponent: () => import('./employee-contact-form/employee-contact-form.component').then(m => m.EmployeeContactFormComponent),
    data: { mode: 'add', title: 'Add Employee Contact' }
  },
  {
    path: 'employee-contact-form/:employeeId/contact/edit/:contactId',
    loadComponent: () => import('./employee-contact-form/employee-contact-form.component').then(m => m.EmployeeContactFormComponent),
      data: { mode: 'edit', title: 'Edit Employee Contact' }
  }
];