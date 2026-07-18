import { Injectable } from '@angular/core';
import { AppNavData } from './navigation.service';
import { PermissionService } from '../../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationFilterService {
   constructor(
    private permissionService: PermissionService
  ) {}
  filter(navItems: AppNavData[]): AppNavData[] {

    const user = this.permissionService.getCurrentUser();

    const filtered = navItems.filter(item => {

      // Always keep titles for now.
      // We'll remove empty ones later.
      if (item.title) {
        return true;
      }

      // Role check
      if (item.roles?.length) {
        const hasRole = user?.roles?.some((role:any) => item.roles!.includes(role));

        if (!hasRole) {
          return false;
        }
      }

      // No page permission required
      if (!item.page) {
        return true;
      }

      // Permission check
      return this.permissionService.canAccessPage(
        item.page,
        item.action
      );
    });

    // Remove titles that have no visible items below them
    return filtered.filter((item, index) => {

      if (!item.title) {
        return true;
      }

      let i = index + 1;

      while (i < filtered.length) {

        if (filtered[i].title) {
          return false;
        }

        return true;
      }

      return false;
    });
  }
}
