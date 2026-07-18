import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { EmployeesService } from '../../../services/employees.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent {
companyId: any;
employees: any = [];
  constructor(
      private router: Router,
      private authService: AuthService,
      private employeesService: EmployeesService
    ) {
      const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
     }
  ngOnInit() {
    this.loadEmployees();
  }
  loadEmployees() {
    this.employeesService.getEmployeesByCompanyId(this.companyId).subscribe((data: any) => {
      this.employees = data;      
    });
  }
  onAddNewEmployee() {
    // Navigate to the employee form page for adding a new employee
    this.router.navigate(['employees/employee-form']);
  }
  onEditEmployee(id: any) {    
    this.router.navigate(['employees/employee-form/', id]);
  }
  onAddEmployeeContact(employeeId: number) {
    this.router.navigate(['employees/employee-contact-form/', employeeId, 'contact', 'add']);
  }
  onEditEmployeeContact(employeeId: number, contactId: number) {
    this.router.navigate(['employees/employee-contact-form/',employeeId,'contact','edit',contactId]);
  }
}
