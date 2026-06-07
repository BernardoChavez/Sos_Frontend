import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadmin.html',
  styles: ``
})
export class SuperadminComponent {
  
  empresasMock = signal([
    { id: 1, nombre: 'Talleres Los Compadres', slug: 'los-compadres', plan: 'Pro', status: 'Activo', creador: 'admin_compadres' },
    { id: 2, nombre: 'Mecánica Express', slug: 'mecanica-express', plan: 'Básico', status: 'Activo', creador: 'juan_perez' }
  ]);

  cerrarSesion() {
    localStorage.removeItem('user');
    window.location.href = '/';
  }
}
