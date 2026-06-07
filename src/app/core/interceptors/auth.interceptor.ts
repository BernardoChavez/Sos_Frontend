import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  
  const tenantService = inject(TenantService);
  const tenantSlug = tenantService.getTenantSlug();
  
  let headers: { [header: string]: string } = {
    'ngrok-skip-browser-warning': 'true'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (tenantSlug) {
    headers['X-Tenant'] = tenantSlug;
  }

  const cloned = req.clone({
    setHeaders: headers
  });
  
  return next(cloned);
};