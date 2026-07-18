import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipModule } from '@coreui/angular';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../services/auth.service';
import { UserPermissionService } from '../../../services/user-permission.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-user-access-list',
  standalone: true,
  imports: [CommonModule,TableModule,TooltipModule,FormsModule, ReactiveFormsModule ],
  templateUrl: './user-access-list.component.html',
  styleUrl: './user-access-list.component.scss'
})
export class UserAccessListComponent {
  companyId: any;
  userId: any;

  userName: string = '';
  loading = false;

  userInfo: any = {};
  userAccessList: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userPermissionService: UserPermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeContext();
    this.bindQueryParams();
  }
  
  // AUTH CONTEXT  
  private initializeContext(): void {
    const authData = this.authService.getUserAuthData();
    this.companyId = authData?.client?.clientId;
    this.userId = authData?.userId;
  }  
  
  // QUERY PARAM HANDLING  
  private bindQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const queryUserId = params['userId'];
        if (queryUserId) {
          this.userId = queryUserId;
        }
        if (this.userId && this.companyId) {
          this.loadData();
        }
      });
  }

  // MASTER LOADER  
  private loadData(): void {
    this.getUserCompanyData();
    this.getUserAccess();
  }
  
  // SINGLE API FOR USER + COMPANY  
  private getUserCompanyData(): void {
    this.loading = true;
    const payload = {
      userId: this.userId,
      companyId: this.companyId
    };
    this.userPermissionService.getusercompanybyuserid(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.userInfo = data;
          this.userName =
            (data?.firstName || '') + ' ' + (data?.lastName || '');
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
    
  // USER PERMISSIONS  
  private getUserAccess(): void {
    const request = {
      companyId: this.companyId,
      userId: this.userId
    };
    this.userPermissionService.getuserpagesaccess(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.userAccessList = res || [];
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  
  savePermissions() {
  const payload = {
    companyId: this.companyId,
    userId: this.userId,
    editedBy: this.authService.getUserAuthData()?.userId,
    permissions: this.userAccessList.map(x => ({
      id: x.id,
      canView: x.canView,
      canAdd: x.canAdd,
      canUpdate: x.canUpdate
    }))
  };

  this.userPermissionService.bulkUpdateUserPageAccess(payload)
      .subscribe({
          next: () => {
              alert("Permissions updated successfully.");
          },
          error: err => {
              console.error(err);
          }
      });
}
  
  // CLEANUP  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  } 
}
