import { Routes } from '@angular/router';
import { roleGuard } from '../../services/role.guard';

export const COMPANY_ROUTES: Routes = [
  {
    path: 'companies',
    loadComponent: () => import('./companies/companies.component').then(m => m.CompaniesComponent),
    canActivate: [roleGuard],
    data: {
      roles: ['SuperAdmin']
    }
  },
  {
    path: 'company/add',
    loadComponent: () => import('./company/company.component').then(m => m.CompanyComponent),
    canActivate: [roleGuard],
    data: {
      roles: ['SuperAdmin']            
    }
  },
  {
    path: 'company/edit/:id',
    loadComponent: () => import('./company/company.component').then(m => m.CompanyComponent),
    canActivate: [roleGuard],
    data: {
      roles: ['SuperAdmin']
    }
  },
];