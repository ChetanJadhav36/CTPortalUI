import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AvatarComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,  
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective, HeaderNavComponent, NavItemComponent, NavLinkDirective, RouterLink, RouterLinkActive, NgTemplateOutlet, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective, DropdownItemDirective]
})
export class DefaultHeaderComponent extends HeaderComponent {

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });
  userInfo: any; 
  loading = true;
  errorMessage = '';
  clientInfo: any ={};
  constructor(
    private authService: AuthService,
    private router: Router) {
    super();
  }
  ngOnInit(): void {
  const authData = this.authService.getUserAuthData();
  if (authData && authData.userId) { 
    this.clientInfo = authData.client; // Assuming client info is part of the auth data     
    // Just call the load method once
    this.loadUserProfile();
  } else {
    this.loading = false;
    this.errorMessage = 'User is not authenticated.';
  }
}

loadUserProfile(): void {
  this.loading = true; // Set loading to true before the call
  
  // Call the service method (which internally uses the token's ID)
  this.authService.getUserProfile().subscribe({
    next: (data) => {
      this.userInfo = data;
      this.loading = false;
    },
    error: (err) => {
      this.errorMessage = 'Could not load user profile.';
      this.loading = false;
      console.error(err);
    }
  });
}

  sidebarId = input('sidebar1');
  onLogout(): void {
    // 1. Clear authentication tokens/data
    this.authService.logout();
    localStorage.clear();
    sessionStorage.clear();
    // 2. Optionally, you can also notify any authentication service about the logout
    // 3. Redirect to the login page
    this.router.navigate(['/login']);
  }
  onChangePassword():void{
    this.router.navigate(['/user-permissions/change-password']);
  }
}
