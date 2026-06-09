import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasService } from '../../../../core/services/empresas.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empresas.html',
  styleUrls: ['./empresas.css']
})
export class EmpresasComponent implements OnInit {
  private empresasService = inject(EmpresasService);
  private cdr = inject(ChangeDetectorRef);
  empresas: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    try {
      this.empresasService.getEmpresas()
        .subscribe({
          next: (data: any) => {
            this.empresas = Array.isArray(data) ? data : (data.value ?? []);
            this.loading = false;
            this.cdr.detectChanges(); // Forzar actualización de UI
          },
          error: (err: any) => {
            this.error = `Error: ${err?.error?.detail ?? err?.message ?? 'No se pudo conectar al servidor'}`;
            this.loading = false;
            console.error('Error loading empresas', err);
            this.cdr.detectChanges(); // Forzar actualización de UI
          }
        });
    } catch (e: any) {
      this.error = 'Error de ejecución en la página: ' + e.message;
      this.loading = false;
      this.cdr.detectChanges(); // Forzar actualización de UI
    }
  }
}
