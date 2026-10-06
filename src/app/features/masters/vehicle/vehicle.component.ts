import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { EmployeesService } from '../../../services/employees.service';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';

@Component({
  selector: 'app-vehicle',
  imports: [CommonModule,FormsModule, ReactiveFormsModule, UpperCaseDirective],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent {
  companyId: any;
  userId: any;
  drivers: any[] = [];
  myForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    vehicleNumber: new FormControl('', Validators.required),
    vType: new FormControl('', Validators.required),
    employeeId: new FormControl(''),
    employeeFullName: new FormControl(''),    
    vAvg: new FormControl(0, [Validators.required, Validators.min(0)]),
    rate: new FormControl(0, [Validators.required, Validators.min(0)]),
    isActive: new FormControl(true)
  });

  isUpdateMode: boolean = false;
  selectedDriverIndex: number = -1;
  constructor(
    private authService: AuthService,
    private masterService: MasterService,
    private employeesService: EmployeesService,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.userId = authData.userId;
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isUpdateMode = true;
      this.masterService.getVehicleById(id).subscribe(
        (response: any) => {
          this.myForm.patchValue({
            code: response.code,            
            vType: response.vType,
            vehicleNumber: response.vehicleNumber,
            employeeId: response.employeeId,      
            employeeFullName: response.driverFullName,      
            vAvg: response.vAvg,
            rate: response.rate,
            isActive: response.isActive
          });
          this.myForm.get('code')?.disable(); // Disable the code field
        },
        (error: any) => {
          this.toastService.error(error.error.message || 'Error fetching Vehicle');
        }
      );
    }
  }  

  onSubmitVehicle() {
  Object.keys(this.myForm.controls).forEach(key => {
    const control = this.myForm.get(key);
    if (control?.invalid) {
      console.log(key, control.errors);
    }
  });

  if (this.myForm.valid) {
    const formValue = this.myForm.getRawValue();

    const vehicleData = {
      code: formValue.code,
      vehicleNumber: formValue.vehicleNumber,
      vType: formValue.vType,
      employeeId: formValue.employeeId,
      vAvg: formValue.vAvg,
      rate: formValue.rate,
      isActive: formValue.isActive,
      companyId: this.companyId,
      createdBy: this.userId,
      editedBy: this.userId
    };

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.onUpdateVehicle(id, vehicleData);
      return;
    }
    this.onCreateVehicle(vehicleData);
  }
  }

  onCreateVehicle(vehicleData: any) {
    this.masterService.createVehicle(vehicleData).subscribe(
      (response: any) => {
        this.toastService.success(response.message || 'Vehicle created successfully');
        this.router.navigate(['masters/vehicles']);
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error creating Vehicle');
      }
    );
  }

  onUpdateVehicle(id: any, vehicleData: any) {
    this.masterService.updateVehicleById(id, vehicleData).subscribe(
      (response: any) => {
        this.toastService.success(response.message || 'Vehicle updated successfully');
        this.router.navigate(['masters/vehicles']);
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error updating Vehicle');
      }
    );
  }

  searchDriver(event: any): void {
    const keyword = event.target.value.trim();
    this.selectedDriverIndex = -1;
    if (!keyword || keyword.length < 2) {
      this.drivers = [];
      this.myForm.patchValue({employeeId: ''});
      return;
  }

  // User is typing a new driver
  this.myForm.patchValue({
    employeeId: ''
  });

  this.employeesService
    .searchEmployees(keyword, this.companyId)
    .subscribe(
      (response: any) => {
        this.drivers = response || [];
        this.selectedDriverIndex = -1;
      },
      (error: any) => {
        this.drivers = [];
        this.toastService.error(
          error.error?.message || 'Error fetching drivers'
        );
      }
    );
}

onDriverKeydown(event: KeyboardEvent): void {
  // If there are no suggestions, nothing to navigate
  if (!this.drivers || this.drivers.length === 0) {
    return;
  }

  // Arrow Down
  if (event.key === 'ArrowDown') {
    event.preventDefault();

    if (this.selectedDriverIndex < this.drivers.length - 1) {
      this.selectedDriverIndex++;
    } else {
      this.selectedDriverIndex = 0;
    }
  }

  // Arrow Up
  else if (event.key === 'ArrowUp') {
    event.preventDefault();

    if (this.selectedDriverIndex > 0) {
      this.selectedDriverIndex--;
    } else {
      this.selectedDriverIndex = this.drivers.length - 1;
    }
  }

  // Enter
  else if (event.key === 'Enter') {
    event.preventDefault();

    if (
      this.selectedDriverIndex >= 0 &&
      this.selectedDriverIndex < this.drivers.length
    ) {
      const driver = this.drivers[this.selectedDriverIndex];

      this.selectDriver(driver);
    }
  }

  // Escape
  else if (event.key === 'Escape') {
    event.preventDefault();

    this.drivers = [];
    this.selectedDriverIndex = -1;
  }
}

selectDriver(driver: any): void {
  this.myForm.patchValue({
    employeeId: driver.employeeId,
    employeeFullName: driver.employeeFullName
  });

  // Close dropdown
  this.drivers = [];

  // Reset keyboard selection
  this.selectedDriverIndex = -1;
}

}
