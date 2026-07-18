import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { UserPermissionService } from '../../../services/user-permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss'
})
export class PageComponent {
  companyId: any;
  userId: any;
  isUpdateMode: boolean = false;

  myForm = new FormGroup({
    pageCode: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    pageName: new FormControl('', [Validators.required]),
    isActive: new FormControl(true)
  });

  constructor(
    private authService: AuthService,
    private userPermissionService: UserPermissionService,
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
      this.userPermissionService.getPageById(id).subscribe(
        (response: any) => {
          this.myForm.patchValue({
            pageCode: response.pageCode,
            pageName: response.pageName,
            isActive: response.isActive
          });
        },
        (error: any) => {
          this.toastService.error(
            error.error.message || 'Error fetching Page'
          );
        }
      );
    }
  }

  onSubmitPage() {
    Object.keys(this.myForm.controls).forEach(key => {
      const control = this.myForm.get(key);
      if (control?.invalid) {
        console.log(key, control.errors);
      }
    });

    if (this.myForm.valid) {
      let pageData = {
        id: this.route.snapshot.paramMap.get('id') || 0,
        companyId: this.companyId,
        pageName: this.myForm.value.pageName,
        pageCode: this.myForm.value.pageCode,
        isActive: this.myForm.value.isActive,
        createdBy: this.userId,
        editedBy: this.userId
      };

      if (this.route.snapshot.paramMap.get('id')) {
        const id = this.route.snapshot.paramMap.get('id');
        this.onUpdatePage(id, pageData);
        return;
      }
      this.onCreatePage(pageData);
    }
  }

  onCreatePage(pageData: any) {
    this.userPermissionService.createPage(pageData).subscribe(
      (response: any) => {
        this.toastService.success(
          response.message || 'Page created successfully'
        );
        this.router.navigate(['user-permissions/pages']);
      },
      (error: any) => {
        this.toastService.error(
          error.error.message || 'Error creating Page'
        );
      }
    );
  }

  onUpdatePage(id: any, pageData: any) {
    this.userPermissionService.updatePageById(id, pageData).subscribe(
      (response: any) => {
        this.toastService.success(
          response.message || 'Page updated successfully'
        );
        this.router.navigate(['user-permissions/pages']);
      },
      (error: any) => {
        this.toastService.error(
          error.error.message || 'Error updating Page'
        );
      }
    );
  }
}
