import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentesService } from '../../../core/services/incidentes';
import { AuthService } from '../../../core/services/auth';
import { TecnicosService } from '../../../core/services/tecnicos';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto animate-in pb-20">
      <!-- Header Profesional -->
      <header class="mb-12">
        <div class="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
                <span class="w-8 h-[2px] bg-blue-600"></span>
                <span class="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Centro de Operaciones</span>
            </div>
            <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Panel de <span class="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-8">Despacho IA</span></h1>
          </div>
          
          <div class="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
             <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse ms-3"></div>
             <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest pe-4">
                {{solicitudes.length}} Casos Activos
             </span>
          </div>
        </div>
      </header>

      <!-- SECCIÓN 1: EMERGENCIAS (FULL WIDTH) -->
      <div class="space-y-12 mb-20">
          <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
              <i class="bi bi-lightning-charge-fill text-amber-500"></i>
              Solicitudes Entrantes por IA
          </h2>

          @for (s of solicitudes; track s.id) {
            <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all duration-500">
                <!-- Imagen en formato natural -->
                <div class="w-full h-80 relative overflow-hidden bg-slate-100">
                    <img [src]="getFotoUrl(s.evidencias)" 
                         class="w-full h-full object-contain bg-slate-900 transition-transform duration-700"
                         alt="Evidencia">
                    <div class="absolute top-6 left-6">
                         <span class="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20"
                               [ngClass]="{
                                 'bg-red-600 text-white': s.prioridad_final === 'Alta',
                                 'bg-amber-500 text-white': s.prioridad_final === 'Media',
                                 'bg-blue-600 text-white': s.prioridad_final === 'Baja'
                               }">
                            {{s.prioridad_final}} Priority
                         </span>
                    </div>
                    <div class="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-white text-[9px] font-bold uppercase tracking-widest border border-white/10">
                        Folio: #{{s.id.slice(0,8).toUpperCase()}}
                    </div>
                </div>

                <!-- Contenido Informativo -->
                <div class="p-10 space-y-10">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <i class="bi bi-robot text-blue-600"></i>
                            <span class="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Diagnóstico Gemini AI</span>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight mb-6">{{s.resumen_ia || 'Analizando incidente...'}}</h3>
                        
                        <div class="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 italic relative mb-6">
                            <i class="bi bi-quote absolute top-4 left-4 text-4xl text-blue-200"></i>
                            <p class="text-sm text-blue-900 font-medium leading-relaxed pl-6">
                                "{{s.transcripcion_voz_ia || 'Sin transcripción de voz disponible.'}}"
                            </p>
                        </div>

                        <!-- Ficha Técnica con Scroll (BUG FIX) -->
                        <div *ngIf="s.resumen_ia" class="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <div class="flex items-center gap-2 mb-4">
                                <i class="bi bi-file-earmark-medical text-slate-400"></i>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ficha Técnica Estructurada</span>
                            </div>
                            <div class="max-h-60 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                                <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {{s.resumen_ia}}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Panel de Asignación (Ahora abajo y espacioso) -->
                    <div class="pt-8 border-t border-slate-100">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                            <div class="md:col-span-6">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Asignar Especialista Disponible</label>
                                <div class="relative">
                                    <select #tecnicoSelect class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-700 focus:border-blue-600 outline-none appearance-none transition-all shadow-inner">
                                        <option [value]="null">-- Seleccionar Técnico para Despacho --</option>
                                        @for (t of tecnicos; track t.id) {
                                          <option [value]="t.id">{{t.nombre}} • {{t.especialidad_principal}}</option>
                                        }
                                    </select>
                                    <i class="bi bi-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                                </div>
                            </div>

                            <div class="md:col-span-4">
                                <button *ngIf="authService.hasPermission('taller.servicio.aceptar')"
                                    (click)="gestionar(s.id, 'aceptar', tecnicoSelect.value)" 
                                    class="w-full h-[64px] bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                                    <i class="bi bi-send-fill text-blue-400"></i>
                                    DESPACHAR AHORA
                                </button>
                            </div>

                            <div class="md:col-span-2">
                                <button *ngIf="authService.hasPermission('taller.servicio.rechazar')"
                                    (click)="gestionar(s.id, 'rechazar')" 
                                    class="w-full h-[64px] bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest">
                                    <i class="bi bi-x-circle text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          } @empty {
            <div class="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <i class="bi bi-bell-slash text-slate-200 text-5xl"></i>
               </div>
               <h3 class="text-2xl font-black text-slate-800 mb-2 italic tracking-tighter">SIN EMERGENCIAS ACTIVAS</h3>
               <p class="text-slate-400 font-medium">El canal de atención automática está en espera.</p>
            </div>
          }
      </div>

      <!-- SECCIÓN 2: COBROS (ABAJO) -->
      <div class="space-y-8 pt-10 border-t border-slate-100">
          <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
              <i class="bi bi-cash-stack text-green-500"></i>
              Control de Liquidación en Efectivo
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              @for (p of pagosPendientes; track p.id) {
                  <div class="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-green-400 transition-all duration-500">
                      <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <i class="bi bi-cash-coin text-9xl text-green-600"></i>
                      </div>
                      
                      <div class="flex justify-between items-start mb-6">
                          <span class="px-4 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                              Pago Pendiente
                          </span>
                          <span class="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{{ p.fecha_creacion | date:'dd MMM, HH:mm' }}</span>
                      </div>

                      <div class="mb-8">
                          <h3 class="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">{{ p.cliente_nombre || 'Cliente SOS' }}</h3>
                          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{{ p.resumen_ia }}</p>
                      </div>

                      <div class="bg-slate-900 rounded-[2rem] p-6 mb-8 text-center relative overflow-hidden">
                          <div class="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Monto a Cobrar</p>
                          <p class="text-4xl font-black text-white italic tracking-tighter">Bs. {{ p.monto_total | number:'1.2-2' }}</p>
                      </div>

                      <button (click)="abrirModalCobro(p)" 
                              class="w-full py-5 bg-green-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-500/20 hover:bg-green-700 flex items-center justify-center gap-3 text-[10px] tracking-widest uppercase">
                          <i class="bi bi-check2-all text-lg"></i>
                          CONFIRMAR RECEPCIÓN
                      </button>
                  </div>
              } @empty {
                  <div class="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">No hay liquidaciones pendientes en este momento</p>
                  </div>
              }
          </div>
      </div>

      <!-- MODAL DE COBRO (IDÉNTICO AL ANTERIOR) -->
      @if (mostrarModal) {
        <div class="fixed inset-0 z-[1060] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade">
            <div class="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-in">
                <div class="p-10 bg-slate-900 text-white text-center relative overflow-hidden">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-600/20 blur-3xl rounded-full"></div>
                    <button (click)="mostrarModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-white">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-12">
                        <i class="bi bi-cash-coin text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-black italic uppercase tracking-tighter">Liquidación de Caja</h3>
                </div>

                <div class="p-10 space-y-8">
                    <div class="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Servicio:</span>
                        <span class="text-xl font-black text-slate-900">Bs. {{ incidenteSeleccionado.monto_total }}</span>
                    </div>

                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Monto Recibido</label>
                        <div class="relative">
                            <span class="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">Bs.</span>
                            <input type="number" [(ngModel)]="montoRecibido" 
                                   class="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 pl-16 text-4xl font-black text-slate-900 focus:border-green-500 outline-none transition-all shadow-inner"
                                   placeholder="0.00">
                        </div>
                    </div>

                    <div class="bg-green-600 p-8 rounded-[2rem] flex justify-between items-center shadow-xl shadow-green-500/20 animate-in" *ngIf="calcularCambio() >= 0">
                        <div>
                            <p class="text-[10px] font-black text-green-200 uppercase tracking-widest mb-1">Cambio</p>
                            <p class="text-4xl font-black text-white italic tracking-tighter">Bs. {{ calcularCambio() | number:'1.2-2' }}</p>
                        </div>
                        <i class="bi bi-arrow-return-left text-4xl text-green-300/50"></i>
                    </div>

                    <button (click)="confirmarCobro()" 
                            [disabled]="montoRecibido < incidenteSeleccionado.monto_total"
                            class="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale text-[10px] tracking-[0.2em] uppercase">
                        PROCESAR LIQUIDACIÓN
                    </button>
                </div>
            </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade { animation: fade 0.2s ease-out; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class DespachoComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  public authService = inject(AuthService);
  private tecnicosService = inject(TecnicosService);
  private cdr = inject(ChangeDetectorRef);

  solicitudes: any[] = [];
  tecnicos: any[] = [];
  pagosPendientes: any[] = [];
  
  mostrarModal: boolean = false;
  incidenteSeleccionado: any = null;
  montoRecibido: number = 0;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const user = this.authService.currentUser;
    if (user && user.taller_id) {
      this.incidentesService.getSolicitudesTaller(user.taller_id).subscribe({
        next: (res) => {
          this.solicitudes = res.filter(s => s.estado === 'asignado' || s.estado === 'pendiente');
          this.pagosPendientes = res.filter(s => s.estado === 'esperando_confirmacion_pago');
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando solicitudes:', err)
      });
      
      this.tecnicosService.getTecnicos(user.taller_id).subscribe({
        next: (res) => {
          this.tecnicos = res.filter(t => t.disponible);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando tecnicos:', err)
      });
    }
  }

  gestionar(id: string, accion: 'aceptar' | 'rechazar', tecnicoId?: any) {
    if (accion === 'aceptar' && (!tecnicoId || tecnicoId === 'null')) {
      alert('Por favor, selecciona un técnico disponible antes de aceptar el servicio.');
      return;
    }

    const tId = (tecnicoId && tecnicoId !== 'null') ? Number(tecnicoId) : undefined;
    
    this.incidentesService.gestionarIncidente(id, accion, tId).subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al gestionar incidente:', err);
        alert('Hubo un error al procesar la solicitud.');
      }
    });
  }

  getFotoUrl(evidencias: any[]): string {
    if (!evidencias || evidencias.length === 0) return 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400';
    const foto = evidencias.find(e => e.tipo_recurso === 'foto' || e.url_recurso.match(/\.(jpeg|jpg|gif|png)$/));
    return foto ? foto.url_recurso : 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400';
  }

  abrirModalCobro(incidente: any) {
    this.incidenteSeleccionado = incidente;
    this.montoRecibido = incidente.monto_total;
    this.mostrarModal = true;
  }

  calcularCambio() {
    if (!this.incidenteSeleccionado) return 0;
    return this.montoRecibido - this.incidenteSeleccionado.monto_total;
  }

  confirmarCobro() {
    if (this.montoRecibido < this.incidenteSeleccionado.monto_total) return;

    this.incidentesService.confirmarPagoEfectivo(this.incidenteSeleccionado.id, this.montoRecibido).subscribe({
        next: (res) => {
            alert(`Pago confirmado exitosamente. Cambio entregado: Bs. ${res.cambio}`);
            this.mostrarModal = false;
            this.cargarDatos();
        },
        error: () => alert('Error al confirmar el cobro')
    });
  }
}
