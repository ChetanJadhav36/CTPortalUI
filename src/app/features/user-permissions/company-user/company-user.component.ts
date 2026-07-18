import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyRole } from '../../../enums/permission.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-user',
  standalone: true,
  imports: [CommonModule,ContainerComponent, RowComponent, ColComponent, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective,ReactiveFormsModule,],
  templateUrl: './company-user.component.html',
  styleUrl: './company-user.component.scss'
})
export class CompanyUserComponent {
  companyId!: number;
  registerForm!: FormGroup;
  isSuperAdmin = false;
  CompanyRole = CompanyRole;

  roles = [
    { id: CompanyRole.Admin, name: 'Admin' },
    { id: CompanyRole.User, name: 'User' }
  ];
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    
  }
   ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: [2, Validators.required] // Default = User
      },
      {
        validators: this.passwordMatchValidator
      }
    );
    const auth = this.authService.getUserAuthData();
   this.isSuperAdmin = auth?.roles?.includes('SuperAdmin');
   if (this.isSuperAdmin) {    
      this.roles = [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' }
    ];
      this.route.paramMap.subscribe(params => {
          this.companyId = Number(params.get('companyId'));
      });
   }
   else {
      this.companyId = auth?.client.clientId;
      this.roles = [{ id: 2, name: 'User' }];
      this.registerForm.patchValue({role: 2});
   }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }

  onSubmit() {
      if (this.registerForm.valid) {  
        this.registerForm.value.companyId = this.companyId; 
        this.registerForm.value.createdBy = this.authService.getUserAuthData()?.userId;
        this.registerForm.value.editedBy = this.authService.getUserAuthData()?.userId;
        this.authService.onRegister(this.registerForm.value).subscribe({
          next: (response) => {            
            this.toastService.success(response.message || 'Company registered successfully');
          if (this.isSuperAdmin) {
            this.router.navigate(['/user-permissions/companies', this.companyId, 'users']);
          } else {
            this.router.navigate(['/user-permissions/company-users-list']);
          }
      },
          error: (error) => {
            this.toastService.error(error.error?.message || 'Registration failed');
          }
      });
      }
  }
}
