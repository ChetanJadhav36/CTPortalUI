import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { IconDirective } from '@coreui/icons-angular';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class AccountsComponent {
  companyId: any;
  accounts: any = []; 
  
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

  ngOnInit() { 
    this.masterService.getAccountsByCompanyId(this.companyId).subscribe(
      (res: any[]) => 
      this.accounts = res);
  }  
  onAddNewAccount() {
    this.router.navigate(['masters/account/add']);
  }
  onEdit(id: any) {
    this.router.navigate([`masters/account/edit/${id}`]);
  }
}
