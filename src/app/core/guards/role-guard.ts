import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Asumiremos que el rol guardado en localStorage o desde el AuthService es el activo.
  // En producción, se desencripta el Token JWT.
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  const user = JSON.parse(userStr);
  const expectedRoles: string[] = route.data['roles'] || [];
  
  if (expectedRoles.length > 0 && !expectedRoles.includes(user.rol)) {
    // Redirigimos dependiendo del contexto (si es superadmin a su panel, sino al dashboard)
    if (user.rol === 'super_admin') {
      router.navigate(['/superadmin']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }
  
  return true;
};
