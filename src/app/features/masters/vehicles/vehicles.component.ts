import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent implements OnInit {

  companyId!: number;
  vehicles: Vehicle[] = [];

  constructor(
    private masterService: MasterService,
    private authService: AuthService,
    private router: Router
  ) {
    const authData = this.authService.getUserAuthData();

    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit(): void {
    if (this.companyId) {
      this.loadVehicles();
    }
  }

  loadVehicles(): void {
    this.masterService.getVehiclesByCompanyId(this.companyId)
      .subscribe({
        next: (res: Vehicle[]) => {
          this.vehicles = res;
          console.log('Loaded vehicles:', this.vehicles);
        },
        error: (err: any) => {
          console.error('Error loading vehicles:', err);
        }
      });
  }

  onAddNewVehicle(): void {
    this.router.navigate(['masters/vehicle/add']);
  }

  onEdit(id: number): void {
    this.router.navigate([`masters/vehicle/edit/${id}`]);
  }
}
export interface Vehicle {
  id: number;
  code: string;
  name: string;
  vType: string;
  driverFullName: string;
  driverMobileNo: string;
  vAvg: number;
  rate: number;
  isActive: boolean;
  companyId: number;
  createdDate: string;
  editedDate: string;
  createdBy: string;
  editedBy: string;
}