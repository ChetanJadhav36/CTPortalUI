import { Routes } from '@angular/router';

export const EMPLOYEE_SALARY_ROUTES: Routes = [ 
  {
    path: 'generate-salary',
    loadComponent: () =>
      import('./generate-salary/generate-salary.component').then(
        m => m.GenerateSalaryComponent
      ),
    data: {
      title: 'Generate Salary'
    }
  },
  {
    path: 'pay-salaries',
    loadComponent: () =>
      import('./pay-salaries/pay-salaries.component').then(
        m => m.PaySalariesComponent
      ),
    data: {
      title: 'Pay Salaries'
    }
  },
  {
  path: 'pay-salary/pay/:salaryId/:employeeId',
  loadComponent: () =>
    import('./pay-salary/pay-salary.component')
      .then(m => m.PaySalaryComponent),
  data: {
    title: 'Pay Salary'
  }
},
];