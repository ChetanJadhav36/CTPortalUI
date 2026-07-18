import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../services/auth.service';
import { UserPermissionService } from '../../../services/user-permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pages',
  imports: [CommonModule,IconDirective,TableModule],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {
  companyId: any;
  pages: any[] = [];

  constructor(
    private userPermissionService: UserPermissionService,
    private authService: AuthService,
    private router: Router
  ) {

    const authData = this.authService.getUserAuthData();

    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
    }
  }

  ngOnInit() {
    this.getPages();
  }

  // Get Pages
  getPages() {
    this.userPermissionService.getPages().subscribe(
      (res: any[]) => {
        this.pages = res;
      },
      (error) => {
        console.error('Error fetching pages', error);
      }
    );
  }

  // Add Page
  onAddNewPage() {    
    this.router.navigate(['user-permissions/page/add']);
  }

  // Edit Page
  onEditPage(id: any) {
    this.router.navigate([`user-permissions/page/edit/${id}`]);
  }
}
