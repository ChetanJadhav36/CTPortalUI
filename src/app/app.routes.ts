import { Routes } from '@angular/router';
import { MASTERS_ROUTES } from './features/masters/masters.routes';
import { USER_PERMISSIONS_ROUTES } from './features/user-permissions/user-permissions.routes';
import { roleGuard } from './services/role.guard';
import { PermissionAction } from './enums/permission.enum';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),  
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'pages',        
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      },
      {
        path: 'masters',
      loadChildren: () => {
        console.log('Loading Masters Routes');
        return import('./features/masters/masters.routes')
          .then(m => m.MASTERS_ROUTES);
      }    
      },
      {
        path: 'company',
        loadChildren: () => import('./features/company/company.routes').then((m) => m.COMPANY_ROUTES)
      },
      {
        path: 'user-permissions',
        loadChildren: () => import('./features/user-permissions/user-permissions.routes').then((m) => m.USER_PERMISSIONS_ROUTES)
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ROUTES)
      },
      {
        path: 'employee-attendance',
        loadChildren: () => import('./features/employee-attendance/employee-attendance.routes').then((m) => m.EMPLOYEE_ATTENDANCE_ROUTES)
      },
      {
        path: 'finance',
        loadChildren: () => import('./features/finance/finance.routes').then((m) => m.FINANCE_ROUTES)
      },
      {
        path: 'employee-salary',
        loadChildren: () => import('./features/employee-salary/employee-salary.routes').then((m) => m.EMPLOYEE_SALARY_ROUTES)
      },
      {
        path: 'tailoring',
        loadChildren: () => import('./features/tailoring/tailoring.routes').then((m) => m.TAILORING_ROUTES)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  { path: '**', redirectTo: 'dashboard' },  
];
