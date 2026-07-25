import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { TailoringService } from '../../../services/tailoring.service';

@Component({
  selector: 'app-customer-orders',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.scss'
})
export class CustomerOrdersComponent {
  companyId: any;
  customerOrders: any[] = [];

  constructor(
    private tailoringService: TailoringService,
    private authService: AuthService,
    private router: Router
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData?.userId) {
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit(): void {
    this.tailoringService.getMeasurementsByCompanyId(this.companyId)
      .subscribe((res: any[]) => {
        this.customerOrders = res;
      });
  }

  onAddNewOrder() {
    this.router.navigate(['tailoring/measurements/add']);
  }

  onEdit(id: number) {
    this.router.navigate([`tailoring/measurements/edit/${id}`]);
  }
}
