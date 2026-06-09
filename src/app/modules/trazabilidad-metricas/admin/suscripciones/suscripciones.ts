import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresasService } from '../../../../core/services/empresas.service';

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suscripciones.html',
  styleUrls: ['./suscripciones.css']
})
export class SuscripcionesComponent implements OnInit {
  private empresasService = inject(EmpresasService);
  private cdr = inject(ChangeDetectorRef);
  
  suscripciones: any[] = [];
  loading = true;
  error = '';

  // Modal State
  showModal = false;
  isEditing = false;
  guardando = false;
  
  // Form Data
  planForm = {
    id: 0,
    nombre: '',
    precio: 0,
    max_talleres: 1,
    max_tecnicos: 5
  };

  ngOnInit(): void {
    this.cargarSuscripciones();
  }

  cargarSuscripciones(): void {
    this.loading = true;
    try {
      this.empresasService.getSuscripciones()
        .subscribe({
          next: (data: any) => {
            this.suscripciones = Array.isArray(data) ? data : (data.value ?? []);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.error = `Error: ${err?.error?.detail ?? err?.message ?? 'No se pudo conectar al servidor'}`;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } catch (e: any) {
      this.error = 'Error de ejecución en la página: ' + e.message;
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalCrear() {
    this.isEditing = false;
    this.planForm = { id: 0, nombre: '', precio: 0, max_talleres: 1, max_tecnicos: 5 };
    this.showModal = true;
  }

  abrirModalEditar(plan: any) {
    this.isEditing = true;
    this.planForm = { ...plan };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarPlan() {
    this.guardando = true;
    if (this.isEditing) {
      const { id, ...data } = this.planForm;
      this.empresasService.actualizarSuscripcion(id, data).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarSuscripciones();
        },
        error: (err) => {
          alert('Error al actualizar: ' + (err?.error?.detail || err.message));
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const { id, ...data } = this.planForm;
      this.empresasService.crearSuscripcion(data).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModal();
          this.cargarSuscripciones();
        },
        error: (err) => {
          alert('Error al crear: ' + (err?.error?.detail || err.message));
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  eliminarPlan(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.')) {
      this.loading = true;
      this.empresasService.eliminarSuscripcion(id).subscribe({
        next: () => {
          this.cargarSuscripciones();
        },
        error: (err) => {
          alert('Error al eliminar: ' + (err?.error?.detail || err.message));
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
