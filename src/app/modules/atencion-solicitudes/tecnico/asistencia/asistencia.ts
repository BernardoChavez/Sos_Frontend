import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentesService } from '../../../../core/services/incidentes';
import { TecnicosService } from '../../../../core/services/tecnicos';
import { interval, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-asistencia-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <header class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <h2 class="text-xl font-bold text-white uppercase tracking-tighter italic">Servicio <span class="text-blue-500">En Curso</span></h2>
          </div>
          <p class="text-slate-500 text-sm">Tu ubicación se está compartiendo en tiempo real con el cliente</p>
        </header>

        <!-- Ficha Técnica IA (Resumen del problema) -->
        <div class="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 mb-6 animate-in" *ngIf="incidente">
          <div class="flex items-center gap-2 mb-3">
            <i class="bi bi-robot text-blue-500 text-xl"></i>
            <h3 class="text-white font-black uppercase tracking-tighter text-sm">Ficha Técnica de Asistencia</h3>
          </div>
          <p class="text-blue-100 text-sm italic mb-4">"{{ incidente.resumen_ia || 'Analizando incidente...' }}"</p>
          
          <div class="grid grid-cols-2 gap-4">
             <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
                <span class="text-[9px] font-black text-slate-500 uppercase block mb-1">Prioridad IA</span>
                <span class="text-xs font-bold" [ngClass]="incidente.prioridad_final === 'Alta' ? 'text-red-500' : 'text-blue-400'">
                  {{ incidente.prioridad_final || 'Media' }}
                </span>
             </div>
             <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
                <span class="text-[9px] font-black text-slate-500 uppercase block mb-1">Costo Estimado</span>
                <span class="text-xs font-bold text-green-500">Bs. {{ incidente.monto_total || '0.00' }}</span>
             </div>
          </div>
        </div>

        <!-- Botón de Navegación GPS -->
        <button (click)="abrirNavegacion()" 
                class="w-full py-4 mb-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl">
           <i class="bi bi-google text-blue-500"></i>
           ABRIR EN GOOGLE MAPS
           <i class="bi bi-box-arrow-up-right text-slate-500 text-xs"></i>
        </button>

        <!-- Tracking Toggle -->
        <div class="flex flex-col gap-4">
          <button *ngIf="estadoActual === 'aceptado' || estadoActual === 'asignado'" (click)="actualizarEstado('en_camino')"
                  class="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest">
             <i class="bi bi-truck-flatbed me-2"></i> INICIAR RECORRIDO (EN CAMINO)
          </button>

          <button *ngIf="estadoActual === 'en_camino'" (click)="actualizarEstado('en_sitio')"
                  class="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest">
             <i class="bi bi-geo-alt-fill me-2"></i> LLEGUÉ AL SITIO
          </button>

          <button *ngIf="estadoActual === 'en_sitio'" (click)="actualizarEstado('finalizado')"
                  class="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest">
             <i class="bi bi-check-circle-fill me-2"></i> FINALIZAR Y COBRAR
          </button>
        </div>

        <!-- Formulario Final -->
        <div *ngIf="mostrarFormularioFinal" class="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 mt-4 animate-in">
          <h3 class="text-white font-bold text-lg mb-4">Cierre del Servicio</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnóstico Final</label>
              <textarea [(ngModel)]="diagnosticoFinal" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-xl text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe el problema encontrado y la solución..."></textarea>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Costo Total (Bs.)</label>
              <input type="number" [(ngModel)]="montoFinal" class="w-full bg-slate-900 border border-slate-700 rounded-xl text-white p-3 text-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.00">
            </div>

            <button (click)="enviarCierre()" [disabled]="!diagnosticoFinal || montoFinal <= 0"
                    class="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
               <i class="bi bi-check-circle-fill"></i> CONFIRMAR CIERRE Y COBRAR
            </button>
            <button (click)="mostrarFormularioFinal = false"
                    class="w-full py-3 mt-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-2xl transition-all text-sm">
               Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AsistenciaTecnicoComponent implements OnInit, OnDestroy {
  private tecnicosService = inject(TecnicosService);
  private incidentesService = inject(IncidentesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  private trackingSub?: Subscription;
  incidenteId: string = '';
  incidente: any = null;
  estadoActual: string = 'aceptado';
  
  mostrarFormularioFinal: boolean = false;
  diagnosticoFinal: string = '';
  montoFinal: number = 0;

  ngOnInit() {
    this.incidenteId = this.route.snapshot.params['id'];
    this.cargarDetalles();
    this.startLocationUpdates();
  }

  cargarDetalles() {
    this.incidentesService.getRastreo(this.incidenteId).subscribe({
      next: (res) => {
        this.incidente = res;
        this.estadoActual = res.estado;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando detalles del incidente:', err)
    });
  }

  abrirNavegacion() {
    if (this.incidente) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.incidente.latitud_cliente},${this.incidente.longitud_cliente}&travelmode=driving`;
      window.open(url, '_blank');
    }
  }

  startLocationUpdates() {
    this.trackingSub = interval(5000).subscribe(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        this.tecnicosService.actualizarUbicacion(pos.coords.latitude, pos.coords.longitude).subscribe();
      });
    });
  }

  actualizarEstado(nuevo: string) {
    if (nuevo === 'finalizado') {
      this.mostrarFormularioFinal = true;
      return;
    }

    this.incidentesService.actualizarEstadoGestion(this.incidenteId, nuevo).subscribe(res => {
      this.estadoActual = nuevo;
      this.cdr.detectChanges();
    });
  }

  enviarCierre() {
    if (this.diagnosticoFinal && this.montoFinal > 0) {
      this.incidentesService.actualizarEstadoGestion(this.incidenteId, 'finalizado').subscribe(() => {
        this.estadoActual = 'finalizado';
        this.incidentesService.finalizarServicio(this.incidenteId, this.diagnosticoFinal, this.montoFinal).subscribe({
          next: () => {
            this.cdr.detectChanges();
            alert('¡Servicio finalizado exitosamente!');
            this.router.navigate(['/dashboard/tecnico/mis-trabajos']);
          },
          error: () => alert('Error al cerrar el servicio.')
        });
      });
    }
  }

  ngOnDestroy() {
    this.trackingSub?.unsubscribe();
  }
}
