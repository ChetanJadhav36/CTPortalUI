import { Routes } from '@angular/router';

export const USER_PERMISSIONS_ROUTES: Routes = [
  // Admin Routes - Company Users & Permissions
  {
      path: 'company-users-list',
      loadComponent: () => import('./company-users-list/company-users-list.component').then(m => m.CompanyUsersListComponent),
      data: {
        title: 'Company Users List'
      }
    },   
  {
      path: 'company-user/add',
      loadComponent: () => import('./company-user/company-user.component').then(m => m.CompanyUserComponent),
      data: {
        title: 'Company User Registration'
      }
  },
   {
      path: 'company-user/edit/:id',
      loadComponent: () => import('./company-user/company-user.component').then(m => m.CompanyUserComponent),
      data: {
        title: 'Company User Edit'
      }
  }, 
// SuperAdmin Routes - Company Users & Permissions
{
    path: 'companies/:companyId/users',
    loadComponent: () => import('./company-users-list/company-users-list.component').then(m => m.CompanyUsersListComponent),
    data: {
      title: 'Company Users List'
    }
},
{
    path: 'companies/:companyId/users/add',
    loadComponent: () => import('./company-user/company-user.component').then(m => m.CompanyUserComponent),
    data: {
      title: 'Company User Registration'
    }
},
{
    path: 'companies/:companyId/users/edit/:id',
    loadComponent: () => import('./company-user/company-user.component').then(m => m.CompanyUserComponent),
    data: {
      title: 'Company User Edit'
    }
},
  {
    path: 'pages',
    loadComponent: () => import('./pages/pages.component').then(m => m.PagesComponent),
    data: {
      title: 'Pages'
    }
},
{
    path: 'page/add',
    loadComponent: () => import('./page/page.component').then(m => m.PageComponent),
    data: {
      title: 'Page Add'
    }
},
{
    path: 'page/edit/:id',
    loadComponent: () => import('./page/page.component').then(m => m.PageComponent),
    data: {
      title: 'Page Edit'
    }
},
 {
    path: 'user-access-list',
    loadComponent: () => import('./user-access-list/user-access-list.component').then(m => m.UserAccessListComponent),
    data: {
      title: 'User Access List'
    }
},
{
    path: 'change-password',
    loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
    data: {
      title: 'Change Password'
    }
},
];