import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from '@coreui/angular';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ToastService } from '../../../services/toast.service';
import { EmployeesService } from '../../../services/employees.service';


@Component({
  selector: 'app-employee-form',
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TableModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent {
  companyId: any;
  userId: any;
  isUpdateMode: boolean = false;
  states: any[] = [];
  activeTab: string = 'employeeForm'; // default active tab
  employeeForm = new FormGroup({
    employeeCode: new FormControl('', [Validators.required,Validators.maxLength(20)]),
    firstName: new FormControl('', Validators.required),
    middleName: new FormControl(''),
    lastName: new FormControl('', Validators.required),
    localAddress: new FormControl('', Validators.required),
    permanentAddress: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    postalCode: new FormControl('', Validators.required),
    phonePrimary: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10,15}$')
    ]),
    phoneSecondary: new FormControl('', [
      Validators.pattern('^[0-9]{10,15}$')
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    birthDate: new FormControl('', Validators.required),
    joinDate: new FormControl('', Validators.required),
    referredBy: new FormControl(''),
    isActive: new FormControl(true),
    companyId: new FormControl(''),
    stateId: new FormControl('', Validators.required)
  });
   constructor(
    private authService: AuthService,
    private masterService: MasterService,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private dateUtcPipe: DateUtcPipe,    
    private employeesService: EmployeesService
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.userId = authData.userId;
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isUpdateMode = true;
      this.getEmployeeById(id);
    }
    this.getStates();
  }
  getEmployeeById(id: any) {
    this.employeesService.getEmployeeById(id).subscribe(
      (response: any) => {        
        this.employeeForm.patchValue({
          employeeCode: response.employeeCode,
          firstName: response.firstName,
          middleName: response.middleName,
          lastName: response.lastName,
          localAddress: response.localAddress,
          permanentAddress: response.permanentAddress,
          city: response.city,
          postalCode: response.postalCode,
          phonePrimary: response.phonePrimary,
          phoneSecondary: response.phoneSecondary,
          email: response.email,          
          birthDate: this.dateUtcPipe.transform(new Date(response.birthDate), 'input'),
          joinDate: this.dateUtcPipe.transform(new Date(response.joinDate), 'input'),
          referredBy: response.referredBy,
          isActive: response.isActive,
          stateId: response.stateId
        });
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error fetching Employee');
      }
    );
  }
  getStates() {
    this.masterService.getStates().subscribe(
      (response: any) => {
        this.states = response;
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error fetching States');
      }
    );
  }
  onSubmitEmployee() {
    Object.keys(this.employeeForm.controls).forEach(key => {
    const control = this.employeeForm.get(key);
      if (control?.invalid) {
        console.log(key, control.errors);
      }
    });
    
  if (this.employeeForm.invalid) {
    this.toastService.error('Please fill all required fields correctly.');
    return;
  }

  this.employeeForm.patchValue({
    companyId: this.companyId,    
    birthDate: this.dateUtcPipe.transform(this.employeeForm.get('birthDate')?.value, 'withCurrentTime'),
    joinDate: this.dateUtcPipe.transform(this.employeeForm.get('joinDate')?.value, 'withCurrentTime'),
  });

  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.updateEmployee(id);
  } else {
    this.registerEmployee();
  }
}
  private registerEmployee() {
  const employeeData = this.employeeForm.value;
  this.employeesService.registerEmployee(employeeData).subscribe(
    (response: any) => {
      this.toastService.success('Employee registered successfully.');
      this.router.navigate(['employees/employee-list']);
    },
    (error: any) => {
      this.toastService.error(error.error?.message || 'Error registering employee');
    }
  );
  }
  private updateEmployee(id: string) {
  const employeeData = this.employeeForm.value;

  this.employeesService.updateEmployeeById(id, employeeData).subscribe(
    (response: any) => {
      this.toastService.success('Employee updated successfully.');
      this.router.navigate(['employees/employee-list']);
    },
    (error: any) => {
      this.toastService.error(error.error?.message || 'Error updating employee');
    }
  );
  }
}
