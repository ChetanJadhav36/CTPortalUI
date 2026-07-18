import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { EmployeesService } from '../../../services/employees.service';

@Component({
  selector: 'app-vehicle',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent {
  companyId: any;
  userId: any;
  drivers: any[] = [];
  myForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    name: new FormControl('', Validators.required),
    vehicleNumber: new FormControl('', Validators.required),
    vType: new FormControl('', Validators.required),
    employeeId: new FormControl(''),
    employeeFullName: new FormControl(''),    
    vAvg: new FormControl(0, [Validators.required, Validators.min(0)]),
    rate: new FormControl(0, [Validators.required, Validators.min(0)]),
    isActive: new FormControl(true)
  });

  isUpdateMode: boolean = false;
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
            name: response.name,
            vehicleNumber: response.vehicleNumber,
            vType: response.vType,
            employeeId: response.employeeId,      
            employeeFullName: response.driverFullName,      
            vAvg: response.vAvg,
            rate: response.rate,
            isActive: response.isActive
          });

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
      let vehicleData = {
        code: this.myForm.value.code,
        name: this.myForm.value.name,
        vehicleNumber: this.myForm.value.vehicleNumber,
        vType: this.myForm.value.vType,
        employeeId: this.myForm.value.employeeId,               
        vAvg: this.myForm.value.vAvg,
        rate: this.myForm.value.rate,
        isActive: this.myForm.value.isActive,
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
  searchDriver(event: any) {
    const keyword = event.target.value;
    if (keyword.length <= 1) {
      this.drivers = [];
      return;
    }
    this.employeesService.searchEmployees(keyword, this.companyId).subscribe(
        (response: any) => {         
          this.drivers = response;
        },
        (error: any) => {
          this.toastService.error(error.error.message || 'Error fetching Vehicle');
        }
      );
  }
  selectDriver(driver:any) {
    this.myForm.patchValue({
      employeeId: driver.employeeId,
      employeeFullName : driver.employeeFullName
    });

    this.drivers = [];
  }
}
