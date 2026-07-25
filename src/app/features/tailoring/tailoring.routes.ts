import { Routes } from '@angular/router';

export const TAILORING_ROUTES: Routes = [
    {
    path: 'customer-orders',
    loadComponent: () => import('./customer-orders/customer-orders.component').then(m => m.CustomerOrdersComponent),
    data: {
      title: 'Customer Orders'
    }
  },
    {
    path: 'measurements/add',
    loadComponent: () => import('./measurements/measurements.component').then(m => m.MeasurementsComponent),
    data: {
      title: 'Measurements'
    }
  },
  {
    path: 'measurements/:id',
    loadComponent: () => import('./measurements/measurements.component').then(m => m.MeasurementsComponent),
    data: {
      title: 'Measurements Edit'
    }
  },    
];