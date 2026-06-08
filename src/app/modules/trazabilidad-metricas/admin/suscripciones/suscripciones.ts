import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suscripciones.html',
  styleUrls: ['./suscripciones.css']
})
export class SuscripcionesComponent implements OnInit {
  private empresasService = inject(EmpresasService);
  suscripciones: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.empresasService.getSuscripciones()
      .pipe(timeout(8000))
      .subscribe({
        next: (data: any) => {
          this.suscripciones = Array.isArray(data) ? data : (data.value ?? []);
          this.loading = false;
        },
        error: (err: any) => {
          if (err?.name === 'TimeoutError') {
            this.error = 'Tiempo de espera agotado. Verifique su conexión.';
          } else {
            this.error = `Error: ${err?.error?.detail ?? err?.message ?? 'No se pudo conectar al servidor'}`;
          }
          this.loading = false;
          console.error('Error loading suscripciones', err);
        }
      });
  }
}
