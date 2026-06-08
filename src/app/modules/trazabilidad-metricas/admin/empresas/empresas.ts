import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasService } from '../../../../core/services/empresas.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empresas.html',
  styleUrls: ['./empresas.css']
})
export class EmpresasComponent implements OnInit {
  private empresasService = inject(EmpresasService);
  empresas: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.empresasService.getEmpresas()
      .pipe(timeout(8000))
      .subscribe({
        next: (data: any) => {
          this.empresas = Array.isArray(data) ? data : (data.value ?? []);
          this.loading = false;
        },
        error: (err: any) => {
          if (err?.name === 'TimeoutError') {
            this.error = 'Tiempo de espera agotado. Verifique su conexión.';
          } else {
            this.error = `Error: ${err?.error?.detail ?? err?.message ?? 'No se pudo conectar al servidor'}`;
          }
          this.loading = false;
          console.error('Error loading empresas', err);
        }
      });
  }
}
