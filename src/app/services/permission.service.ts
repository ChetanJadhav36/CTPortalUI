import { Injectable } from '@angular/core';
import { PermissionAction } from '../enums/permission.enum';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  // ✅ Master check for a specific action
  canAccessPage(pageCode: string, action?: PermissionAction): boolean {
    const permissions = this.authService.getPermissions();
    if (!permissions?.length) return false;

    const resolvedAction = action ?? PermissionAction.View;

    const page = permissions.find(
      (x: any) =>
        x.PageCode?.toLowerCase() === pageCode.toLowerCase() &&
        x.IsActive === true
    );

    if (!page) return false;

    const map: Record<PermissionAction, keyof typeof page> = {
      [PermissionAction.View]: 'CanView',
      [PermissionAction.Add]: 'CanAdd',
      [PermissionAction.Update]: 'CanUpdate',
    };

    return !!page[map[resolvedAction]];
  }

  // ✅ NEW: Check if user has *any* permission for a page
  hasAnyPagePermission(pageCode: string): boolean {
    const permissions = this.authService.getPermissions();
    if (!permissions?.length) return false;

    const page = permissions.find(
      (x: any) =>
        x.PageCode?.toLowerCase() === pageCode.toLowerCase() &&
        x.IsActive === true
    );

    if (!page) return false;

    return !!(page.CanView || page.CanAdd || page.CanUpdate || page.CanDelete);
  }
  getCurrentUser() {
   return this.authService.getUserAuthData();
}
}

