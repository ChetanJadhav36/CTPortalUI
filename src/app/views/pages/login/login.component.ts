import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { AuthService } from '../../../services/auth.service';
import { TokenUtility } from '../../../services/token.utility';
import { ToastService } from '../../../services/toast.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, CardComponent, CardBodyComponent, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, ReactiveFormsModule]
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    companyCode: new FormControl('',Validators.required)
  });
  
  constructor(
    private authService: AuthService,
    private tokenUtility: TokenUtility,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value as {
      email: string;
      password: string;
    }).subscribe({
      next: () => {
        this.toastService.success('Login successful');

        if (!this.isTokenValidWithPermission()) {
          this.toastService.error('Invalid token or missing permissions');
          return;
        }

        const authData = this.authService.getUserAuthData();
        if (authData?.roles.some((r: string) => r.toLowerCase() === 'superadmin')) {
          this.router.navigate(['/company/companies']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        const errorMessage = error?.error || 'Login failed. Please try again.';
        this.toastService.error(errorMessage);
      }
    });
  }
}
  private isTokenValidWithPermission(): boolean {
    // Check if token exists and is not expired
    if (this.tokenUtility.isTokenExpired()) {
      return false;
    }

    // Check if user has role/permission
    const userRole = this.tokenUtility.getTokenClaim<string>('role');
    return !!userRole;
  }
}
