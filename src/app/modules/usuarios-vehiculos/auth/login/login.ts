import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { TenantService } from '../../../../core/services/tenant.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  credentials = { email: '', password: '' };
  loading = false;
  errorMessage = '';

  onLogin() {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        const isGlobal = this.tenantService.isGlobalContext();
        const role = res.user?.rol;

        // Validaciones estrictas de aislamiento SaaS
        if (isGlobal && (role === 'admin_taller' || role === 'tecnico' || role === 'admin_empresa')) {
            this.errorMessage = 'Acceso Denegado: Debes iniciar sesión desde el portal privado de tu taller.';
            this.loading = false;
            this.authService.logout();
            return;
        }

        if (!isGlobal && (role === 'cliente' || role === 'super_admin')) {
            this.errorMessage = 'Acceso Denegado: Los clientes y administradores globales deben iniciar sesión desde la plataforma principal.';
            this.loading = false;
            this.authService.logout();
            return;
        }

        if (role === 'super_admin') {
          this.router.navigate(['/superadmin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail || 'Error de conexión con el servidor.';
      }
    });
  }
}
