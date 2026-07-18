import { Component } from '@angular/core';
import { MasterService } from '../../../services/master.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { TooltipModule } from '@coreui/angular';

@Component({
  selector: 'app-companies',
  imports: [CommonModule,IconDirective,TableModule,TooltipModule],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent {
  companies: any = [];     
    constructor(
      private masterService: MasterService,
      private router: Router
    ) { }
  
    ngOnInit() {  
      this.masterService.getCompanies().subscribe(
        (res: any[]) => 
        this.companies = res);
    }  
    onAddNewCompany() {
      this.router.navigate(['company/company/add']);
    }
    onEdit(id: any) {
      this.router.navigate([`company/company/edit/${id}`]);
    }
    onCompanyUsers(companyId: any) {
      this.router.navigate(['/user-permissions/companies',companyId,'users']);
  }
}
  