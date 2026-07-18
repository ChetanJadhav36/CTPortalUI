import { Routes } from '@angular/router';
import { roleGuard } from '../../services/role.guard';
import { PermissionAction } from '../../enums/permission.enum';

export const MASTERS_ROUTES: Routes = [
  {
    path: 'account-groups',
    canActivate: [roleGuard],
    loadComponent: () => import('./account-groups/account-groups.component').then(m => m.AccountGroupsComponent),
    data: {
      title: 'Account Groups',
      roles: ['Admin', 'User'],
      page: 'AG',
      action: PermissionAction.View
    }
  },
  {
    path: 'account-group/add',
    canActivate: [roleGuard],
    loadComponent: () => import('./account-group/account-group.component').then(m => m.AccountGroupComponent),
    data: {
      title: 'Account Groups',
      roles: ['Admin', 'User'],
      page: 'AG',
      action: PermissionAction.View
    }
  },
  {
    path: 'account-group/edit/:id',
    canActivate: [roleGuard],
    loadComponent: () => import('./account-group/account-group.component').then(m => m.AccountGroupComponent),
    data: {
      title: 'Account Group Edit',
      roles: ['Admin', 'User'],
      page: 'AG',
      action: PermissionAction.Update
    }
  },
  {
    path: 'accounts',
    canActivate: [roleGuard],
    loadComponent: () => import('./accounts/accounts.component').then(m => m.AccountsComponent),
    data: {
      title: 'Accounts',
      roles: ['Admin', 'User'],
      page: 'ACC',
      action: PermissionAction.View
    }
  },
  {
    path: 'account/add',
    canActivate: [roleGuard],
    loadComponent: () => import('./account/account.component').then(m => m.AccountComponent),
    data: {
      title: 'Account Add',
      roles: ['Admin', 'User'],
      page: 'ACC',
      action: PermissionAction.Add
    }
  },
  {
    path: 'account/edit/:id',
    canActivate: [roleGuard],
    loadComponent: () => import('./account/account.component').then(m => m.AccountComponent),
    data: {
      title: 'Account Edit',
      roles: ['Admin', 'User'],
      page: 'ACC',
      action: PermissionAction.Update
    }
  },
  {
  path: 'vehicles',
  canActivate: [roleGuard],
  loadComponent: () => import('./vehicles/vehicles.component').then(m => m.VehiclesComponent),
  data: {
    title: 'Vehicles',
    roles: ['Admin', 'User'],
    page: 'VEH',
    action: PermissionAction.View
  }
},
{
  path: 'vehicle/add',
  canActivate: [roleGuard],
  loadComponent: () => import('./vehicle/vehicle.component').then(m => m.VehicleComponent),
  data: {
    title: 'Vehicle Add',
    roles: ['Admin', 'User'],
    page: 'VEH',
    action: PermissionAction.Add
  }
},
{
  path: 'vehicle/edit/:id',
  canActivate: [roleGuard],
  loadComponent: () => import('./vehicle/vehicle.component').then(m => m.VehicleComponent),
  data: {
    title: 'Vehicle Edit',
    roles: ['Admin', 'User'],
    page: 'VEH',
    action: PermissionAction.Update
  }
}
];