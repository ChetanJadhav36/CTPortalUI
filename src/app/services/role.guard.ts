import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { PermissionService } from './permission.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const user = authService.getUserAuthData();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Role check
  const roles = route.data['roles'] as string[] | undefined;

  if (roles?.length) {
    const hasRole = user.roles.some((r:any) => roles.includes(r));

    if (!hasRole) {
      return router.createUrlTree(['/404']);
    }
  }

  const page = route.data['page'];

  if (!page) {
    return true;
  }

  const actions = route.data['action'];

  let allowed = false;

  if (Array.isArray(actions)) {
    allowed = actions.some(a =>
      permissionService.canAccessPage(page, a)
    );
  } else {
    allowed = permissionService.canAccessPage(page, actions);
  }

  return allowed ? true : router.createUrlTree(['/404']);
};
