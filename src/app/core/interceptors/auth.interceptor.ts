import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  
  let headers: { [header: string]: string } = {
    'ngrok-skip-browser-warning': 'true'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({
    setHeaders: headers
  });
  
  return next(cloned);
};