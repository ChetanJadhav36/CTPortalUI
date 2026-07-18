import { Routes } from '@angular/router';

export const EMPLOYEE_ATTENDANCE_ROUTES: Routes = [
  {
    path: 'attendance-list',
    loadComponent: () =>
      import('./attendance-list/attendance-list.component').then(
        m => m.AttendanceListComponent
      ),
    data: {
      title: 'Attendance List'
    }
  },
  {
    path: 'attendance-detail',
    loadComponent: () =>
      import('./attendance-detail/attendance-detail.component').then(
        m => m.AttendanceDetailComponent
      ),
    data: {
      title: 'Add Attendance'
    }
  },

  {
    path: 'attendance-detail/:id',
    loadComponent: () =>
      import('./attendance-detail/attendance-detail.component').then(
        m => m.AttendanceDetailComponent
      ),
    data: {
      title: 'Edit Attendance'
    }
  }
];