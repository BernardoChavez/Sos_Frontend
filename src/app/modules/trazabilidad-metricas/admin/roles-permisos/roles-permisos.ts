import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermisosService } from '../../../../core/services/permisos';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-permisos.html'
})
export class RolesPermisosComponent implements OnInit {
  private permisosService = inject(PermisosService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  matriz: any[] = [];
  roles = ['cliente', 'admin_taller', 'tecnico', 'super_admin'];
  moduloExpandido: string | null = null;

  ngOnInit() { 
    this.cargarMatriz(); 
  }

  toggleModulo(modulo: string) {
    this.moduloExpandido = this.moduloExpandido === modulo ? null : modulo;
  }

  cargarMatriz() {
    this.permisosService.getMatriz().subscribe({
      next: (data) => {
        this.matriz = data;
        this.cdr.detectChanges();
      }
    });
  }

  get modulos(): string[] {
    return [...new Set(this.matriz.map(p => p.modulo))];
  }

  getCasosUsoPorModulo(modulo: string): string[] {
    return [...new Set(this.matriz.filter(p => p.modulo === modulo).map(p => p.caso_uso))];
  }

  getPermisosPorCU(modulo: string, cu: string): any[] {
    return this.matriz.filter(p => p.modulo === modulo && p.caso_uso === cu);
  }

  toggle(rol: string, permisoId: number) {
    this.permisosService.togglePermiso(rol, permisoId).subscribe(() => {
      this.cargarMatriz();
      // Refrescamos los permisos del usuario actual en caliente
      this.authService.refreshUser();
    });
  }
}
