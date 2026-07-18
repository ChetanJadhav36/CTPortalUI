import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserPermissionService } from '../../../services/user-permission.service';
import { TooltipModule } from '@coreui/angular';

@Component({
  selector: 'app-company-users-list',
  imports: [CommonModule,IconDirective,TableModule,TooltipModule],
  templateUrl: './company-users-list.component.html',
  styleUrl: './company-users-list.component.scss'
})
export class CompanyUsersListComponent {
  companyUsers: any = [];
  clientInfo: any = {};
  companyId: number = 0;
  userId:string = '';
  isSuperAdmin = false;
   constructor(
      private userPermissionService: UserPermissionService,
      private router: Router,
      private authService: AuthService,
      private route: ActivatedRoute
    ) { }
    ngOnInit() {
    const auth = this.authService.getUserAuthData();
    this.isSuperAdmin = auth?.roles?.includes('SuperAdmin');
    if (this.isSuperAdmin) {
        this.route.paramMap.subscribe(params => {
            this.companyId = Number(params.get('companyId'));
            this.loadUsers();
        });
    }
    else {
        this.companyId = auth?.client.clientId;
        this.loadUsers();
    }
    }
    loadUsers() {
    this.userPermissionService.getUsersCompanyId(this.companyId)
        .subscribe(res => {
            this.companyUsers = res;
        });
    }
    
  onRegisterNewUser() {
    if (this.isSuperAdmin) {
        this.router.navigate(['/user-permissions/companies', this.companyId, 'users', 'add' ]);
    } else {
        this.router.navigate(['/user-permissions/company-user/add']);
    }
}
  onEdit(id: any) {
    this.router.navigate([`user-permissions/company-user/edit/${id}`]);
  }
  onUserAccessList(user: any) {
    this.router.navigate([`user-permissions/user-access-list`], { queryParams: { userId: user.userId } });
}
}
