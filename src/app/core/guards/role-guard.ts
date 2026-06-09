import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const tenantService = inject(TenantService);
  
  const userStr = localStorage.getItem('user_data');
  
  if (!userStr) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  const user = JSON.parse(userStr);
  const isGlobal = tenantService.isGlobalContext();
  const role = user.rol;

  // Validación de Arquitectura SaaS (Tenant vs Global)
  if (isGlobal && (role === 'admin_taller' || role === 'tecnico' || role === 'admin_empresa')) {
      alert('Acceso Denegado: Debes iniciar sesión desde el portal privado de tu Taller.');
      localStorage.removeItem('user_data');
      localStorage.removeItem('access_token');
      router.navigate(['/auth/login']);
      return false;
  }

  if (!isGlobal && (role === 'cliente' || role === 'super_admin')) {
      alert('Acceso Denegado: Los clientes y administradores globales no pueden entrar a los portales privados de los talleres. Ingrese desde la plataforma general.');
      localStorage.removeItem('user_data');
      localStorage.removeItem('access_token');
      router.navigate(['/auth/login']);
      return false;
  }

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
