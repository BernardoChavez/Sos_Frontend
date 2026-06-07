import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../core/services/empresa';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planes.html',
  styles: [`
    .glass-nav {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  `]
})
export class PlanesComponent implements OnInit {
  planes = signal<any[]>([]);
  planSeleccionado = signal<any>(null);
  paso = signal<number>(1);
  
  // Formulario de Empresa
  empresaData = {
    nombre: '',
    slug: '',
    suscripcion_id: 1,
    admin_nombre: '',
    admin_email: '',
    admin_password: ''
  };
  
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private empresaService: EmpresaService, private router: Router) {}

  ngOnInit() {
    this.empresaService.obtenerPlanes().subscribe(res => {
      this.planes.set(res);
    });
  }

  seleccionarPlan(plan: any) {
    this.planSeleccionado.set(plan);
    this.empresaData.suscripcion_id = plan.id;
    this.paso.set(2); // Pasar al formulario
  }
  
  volver() {
    if (this.paso() === 2) {
      this.paso.set(1);
    } else {
      this.router.navigate(['/']);
    }
  }

  generarSlug() {
    if (this.empresaData.nombre) {
      this.empresaData.slug = this.empresaData.nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
  }

  registrarEmpresa() {
    if (!this.empresaData.nombre || !this.empresaData.slug || !this.empresaData.admin_email) return;
    
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.empresaService.registrarEmpresa(this.empresaData).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        // ¡La magia del subdominio!
        const urlDestino = `http://${res.slug}.localhost:4200/auth/login`;
        
        // Creamos un alert amigable y redirigimos
        alert(`¡Felicidades! Se ha aprovisionado tu servidor privado de base de datos.\nTu nuevo portal es: ${res.slug}.localhost`);
        
        window.location.href = urlDestino;
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || 'Hubo un error al registrar la empresa.');
      }
    });
  }
}
