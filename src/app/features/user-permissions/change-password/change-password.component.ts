import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonDirective, CardBodyComponent, CardComponent, ColComponent, ContainerComponent, FormControlDirective, FormDirective, InputGroupComponent, InputGroupTextDirective, RowComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from 'src/app/services/auth.service';
import { MasterService } from 'src/app/services/master.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective,ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit{  
  changePasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private masterService: MasterService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['',[Validators.required,Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      }
    );

  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword
      ? null
      : { passwordsNotMatch: true };
  }
  onLogout(): void {
    // 1. Clear authentication tokens/data
    this.authService.logout();
    localStorage.clear();
    sessionStorage.clear();
    // 2. Optionally, you can also notify any authentication service about the logout
    // 3. Redirect to the login page
    this.router.navigate(['/login']);
  }  
  onSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    }
    console.log('client Data', this.authService.getUserAuthData());
    const payload = {
      userId: this.authService.getUserAuthData()?.userId,
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      confirmPassword: this.changePasswordForm.value.confirmPassword
    };

    this.masterService.changePassword(payload).subscribe({
      next: (response: any) => {
        this.toastService.success(response.message || 'Password changed successfully');
        this.onLogout();
        
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to change password');
      }
    });
  }
}
