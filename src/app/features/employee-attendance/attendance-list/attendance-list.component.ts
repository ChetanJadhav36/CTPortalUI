import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from '../../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { EmployeesService } from '../../../services/employees.service';
import { AttendanceStatus } from '../../../enums/permission.enum';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule,TableModule],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.scss'
})
export class AttendanceListComponent {
  companyId: any;
  employees: any[] = [];
  selectedMonth: string = '';
  daysInMonth: number[] = [];

  AttendanceStatus = AttendanceStatus;
  today = new Date();

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private employeesService: EmployeesService,
    private dateUtcPipe: DateUtcPipe
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }    
    this.selectedMonth = `${this.today.getFullYear()}-${String(this.today.getMonth() + 1).padStart(2, '0')}`;
    this.generateDays();
  }

  ngOnInit(): void {
    this.loadAttendance();
  }

  getDayName(day: number): string {
  const [year, month] = this.selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

  // Generate month days
  generateDays(): void {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate();
    this.daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  }

  // Initialize attendance object
  private initAttendance(): any {
  const obj: any = {};

  const [year, month] = this.selectedMonth.split('-').map(Number);
  const today = new Date();

  this.daysInMonth.forEach(day => {

    const date = new Date(year, month - 1, day);

    // Sunday = Holiday
    if (date.getDay() === 0) {
      obj[day] = AttendanceStatus.Holiday;
      return;
    }

    // Default Present for today only
    if (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      day === today.getDate()
    ) {
      obj[day] = AttendanceStatus.Present;
    } else {
      obj[day] = null;
    }
  });

  return obj;
}
  

  // Load attendance + employees
  loadAttendance(): void {

    this.generateDays();
    const [year, month] = this.selectedMonth.split('-').map(Number);
    this.employeesService
      .getEmployeesByCompanyId(this.companyId)
      .subscribe((employees: any[]) => {       
        employees.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', undefined, { sensitivity: 'base'}));
        // Step 1: Init employees
        this.employees = employees.map(emp => ({...emp, attendance: this.initAttendance()}));
        // Step 2: load attendance data
        this.attendanceService.getMonthlyAttendance(this.companyId, year, month)
          .subscribe((attendanceData: any[]) => {            
            if (!attendanceData) return;
            attendanceData.forEach((att: any) => {
              const employee = this.employees.find( x => x.id === att.employeeId);
              if (!employee) return;
              
              const day = new Date(att.attendanceDate).getDate();
              employee.attendance[day] =  typeof att.status === 'string' ? AttendanceStatus[att.status] ?? 0 : att.status; });
          });
      });
  }

  // Save attendance
  saveAttendance(): void {
  const attendances: any[] = [];
  this.employees.forEach(emp => {
    this.daysInMonth.forEach(day => {
      const status = emp.attendance?.[day];
      if (status != null) {
        attendances.push({
          companyId: this.companyId,
          employeeId: emp.id,
          attendanceDate: `${this.selectedMonth}-${String(day).padStart(2, '0')}`,
          status: Number(status),
          remarks: ''
        });
      }
    });
  });

  const payload = {
    companyId: this.companyId,
    attendances: attendances
  };

  this.attendanceService
    .saveMonthlyAttendance(payload)
    .subscribe(() => {
      alert('Attendance Saved Successfully');
    });

}   

getAttendanceColor(status: AttendanceStatus | null, day?: number): string {

  // Attendance status colors
  switch (status) {
    case AttendanceStatus.Present:
      return '#198754'; // Bootstrap success - green

    case AttendanceStatus.Absent:
      return '#dc3545'; // Bootstrap danger - red

    case AttendanceStatus.Late:
      return '#ffc107'; // Bootstrap warning - yellow

    case AttendanceStatus.HalfDay:
      return '#fd7e14'; // Orange

    case AttendanceStatus.OnLeave:
      return '#0dcaf0'; // Bootstrap info - cyan

    case AttendanceStatus.Holiday:
      return '#0d6efd'; // Bootstrap primary - blue
  }
  // No attendance selected.// Check whether the date is Sunday.
  if (day) {
    const [year, month] = this.selectedMonth.split('-')
        .map(Number);

      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // Sunday = 0
      if (dayOfWeek === 0) {
        return '#0d6efd'; // Weekend blue
      }
  }

  // Default / empty attendance
return '#ffffff';
}
getAttendanceTextColor(status: AttendanceStatus | null, day?: number): string {
  switch (status) {
    case AttendanceStatus.Present:
      return '#ffffff';

    case AttendanceStatus.Absent:
      return '#ffffff';

    case AttendanceStatus.Late:
      return '#212529';

    case AttendanceStatus.HalfDay:
      return '#ffffff';

    case AttendanceStatus.OnLeave:
      return '#212529';

    case AttendanceStatus.Holiday:
      return '#ffffff';
  }
  
  // Sunday
  if (day) {
    const [year, month] = this.selectedMonth
      .split('-')
      .map(Number);

    const date = new Date(year, month - 1, day);

    // Sunday = 0
    if (date.getDay() === 0) {
      return '#ffffff';
    }
  }

  // Empty/default
  return '#6c757d';
}
  // TrackBy for performance
  trackByEmpId(index: number, item: any): any {
    return item.id;
  }  
}
