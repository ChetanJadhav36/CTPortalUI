import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MasterService } from '../../../services/master.service';
import { IconDirective } from '@coreui/icons-angular';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-account-groups',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './account-groups.component.html',
  styleUrl: './account-groups.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class AccountGroupsComponent {  
  accountGroups: any = []; 
  
  constructor(
    private masterService: MasterService,
    private router: Router,
    private _authService: AuthService
  ) { }

  ngOnInit() {  
    var companyId = this._authService.getUserAuthData()?.client?.clientId;
    this.masterService.getAccountGroups(companyId).subscribe(
      (res: any[]) => 
      this.accountGroups = res);
  }  
  onAddNewAccountGroup() {
    this.router.navigate(['masters/account-group/add']);
  }
  onEdit(id: any) {
    this.router.navigate([`masters/account-group/edit/${id}`]);
  }
}
