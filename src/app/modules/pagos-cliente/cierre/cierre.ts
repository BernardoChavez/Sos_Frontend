import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentesService } from '../../../core/services/incidentes';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cierre-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto animate-in">
      <div class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div class="bg-slate-900 p-10 text-center text-white relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div class="relative z-10">
                <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/40">
                    <i class="bi bi-check-lg text-4xl"></i>
                </div>
                <h2 class="text-3xl font-black italic">¡SERVICIO COMPLETADO!</h2>
                <p class="text-slate-400 font-medium mt-2">Tu folio #{{incidenteId.slice(0,6).toUpperCase()}} está listo para el cierre.</p>
            </div>
        </div>

        <div class="p-10">
            <!-- Sección Pago -->
            <div *ngIf="paso === 'pago'" class="animate-in">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="font-black text-slate-800 text-xl uppercase tracking-tighter">1. Método de Pago</h3>
                    <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                </div>

                <!-- Selector de Métodos -->
                <div class="grid grid-cols-3 gap-3 mb-8">
                    <button (click)="metodoSeleccionado = 'qr'" 
                            [class.border-blue-500]="metodoSeleccionado === 'qr'"
                            [class.bg-blue-50]="metodoSeleccionado === 'qr'"
                            class="p-4 border-2 border-slate-100 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-blue-200">
                        <i class="bi bi-qr-code text-2xl"></i>
                        <span class="text-[9px] font-black uppercase tracking-widest">QR / Transfer</span>
                    </button>
                    <button (click)="metodoSeleccionado = 'efectivo'" 
                            [class.border-green-500]="metodoSeleccionado === 'efectivo'"
                            [class.bg-green-50]="metodoSeleccionado === 'efectivo'"
                            class="p-4 border-2 border-slate-100 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-green-200">
                        <i class="bi bi-cash-stack text-2xl"></i>
                        <span class="text-[9px] font-black uppercase tracking-widest">Efectivo</span>
                    </button>
                    <button (click)="metodoSeleccionado = 'tarjeta'" 
                            [class.border-amber-500]="metodoSeleccionado === 'tarjeta'"
                            [class.bg-amber-50]="metodoSeleccionado === 'tarjeta'"
                            class="p-4 border-2 border-slate-100 rounded-2xl flex flex-col items-center gap-2 transition-all hover:border-amber-200">
                        <i class="bi bi-credit-card text-2xl"></i>
                        <span class="text-[9px] font-black uppercase tracking-widest">Tarjeta / POS</span>
                    </button>
                </div>
                
                <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center mb-8" *ngIf="metodoSeleccionado === 'qr'">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SOS-PAGO-{{incidenteId}}" 
                         class="mx-auto mb-6 shadow-2xl rounded-2xl border-4 border-white" alt="QR Pago">
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Escanea para Pagar</p>
                    <h4 class="text-5xl font-black text-slate-900 italic mb-6">Bs. {{ monto }}</h4>
                    
                    <div class="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden group cursor-pointer hover:border-blue-500 transition-all">
                        <input type="file" class="absolute inset-0 opacity-0 cursor-pointer z-10" (change)="comprobanteSubido = true">
                        <div class="flex flex-col items-center gap-2" *ngIf="!comprobanteSubido">
                            <i class="bi bi-cloud-arrow-up text-3xl text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Subir comprobante bancario</span>
                        </div>
                        <div class="flex flex-col items-center gap-2" *ngIf="comprobanteSubido">
                            <i class="bi bi-file-earmark-check-fill text-3xl text-green-500"></i>
                            <span class="text-xs font-bold text-green-600 uppercase tracking-widest">Comprobante verificado</span>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 border-2 border-dashed border-green-200 rounded-[2rem] p-10 text-center mb-8" *ngIf="metodoSeleccionado === 'efectivo'">
                    <i class="bi bi-person-check-fill text-6xl text-green-500 mb-4 block"></i>
                    <p class="text-sm font-bold text-green-800 uppercase tracking-widest mb-2">Pago Presencial</p>
                    <h4 class="text-5xl font-black text-green-900 italic mb-4">Bs. {{ monto }}</h4>
                    <p class="text-xs text-green-600 italic">"Entrega el dinero directamente al técnico asignado."</p>
                </div>

                <div class="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2rem] p-10 text-center mb-8" *ngIf="metodoSeleccionado === 'tarjeta'">
                    <!-- Tarjeta Visual -->
                    <div class="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-left relative overflow-hidden shadow-2xl mb-8 mx-auto max-w-[320px] animate-in">
                        <div class="absolute top-0 right-0 p-6 opacity-20">
                            <i class="bi bi-bank2 text-6xl text-white"></i>
                        </div>
                        <div class="mb-8">
                            <i class="bi bi-chip-fill text-4xl text-amber-400"></i>
                        </div>
                        <div class="text-white font-mono text-xl tracking-[0.2em] mb-4">
                            {{ tarjeta.numero || '**** **** **** ****' }}
                        </div>
                        <div class="flex justify-between items-end">
                            <div class="text-white/60">
                                <p class="text-[8px] uppercase tracking-widest">Titular</p>
                                <p class="text-xs font-bold uppercase tracking-widest">{{ tarjeta.nombre || 'Nombre del Titular' }}</p>
                            </div>
                            <div class="text-white/60 text-right">
                                <p class="text-[8px] uppercase tracking-widest">Exp</p>
                                <p class="text-xs font-bold uppercase tracking-widest">{{ tarjeta.exp || 'MM/AA' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Formulario Tarjeta -->
                    <div class="space-y-4 text-left">
                        <div>
                            <label class="form-label">Número de Tarjeta</label>
                            <input type="text" [(ngModel)]="tarjeta.numero" placeholder="0000 0000 0000 0000" class="form-control">
                        </div>
                        <div>
                            <label class="form-label">Nombre del Titular</label>
                            <input type="text" [(ngModel)]="tarjeta.nombre" placeholder="Nombre como aparece en la tarjeta" class="form-control">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">Vencimiento</label>
                                <input type="text" [(ngModel)]="tarjeta.exp" placeholder="MM/AA" class="form-control">
                            </div>
                            <div>
                                <label class="form-label">CVV</label>
                                <input type="password" [(ngModel)]="tarjeta.cvv" placeholder="***" class="form-control">
                            </div>
                        </div>
                    </div>
                </div>

                <button (click)="pagar()" 
                        [disabled]="loading || (metodoSeleccionado === 'qr' && !comprobanteSubido) || (metodoSeleccionado === 'tarjeta' && !tarjeta.numero)"
                        class="w-full py-5 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        [ngClass]="{
                            'bg-blue-600 text-white shadow-blue-500/30': metodoSeleccionado === 'qr',
                            'bg-green-600 text-white shadow-green-500/30': metodoSeleccionado === 'efectivo',
                            'bg-slate-900 text-white shadow-slate-900/30': metodoSeleccionado === 'tarjeta'
                        }">
                    <i class="bi bi-shield-check" *ngIf="!loading"></i>
                    <span *ngIf="!loading">{{ metodoSeleccionado === 'tarjeta' ? 'PAGAR CON TARJETA SEGURO' : 'CONFIRMAR PAGO REALIZADO' }}</span>
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                </button>
            </div>

            <!-- Sección Calificación -->
            <div *ngIf="paso === 'calificar'" class="animate-in">
                <div class="text-center mb-10">
                    <h3 class="font-black text-slate-800 text-2xl italic mb-2">¿Cómo fue tu experiencia?</h3>
                    <p class="text-slate-500 font-medium">Tu opinión ayuda a mejorar a nuestros técnicos.</p>
                </div>

                <div class="flex justify-center gap-4 mb-10">
                    <button *ngFor="let s of [1,2,3,4,5]" (click)="estrellas = s" 
                            class="text-5xl transition-all hover:scale-125"
                            [class.text-amber-400]="estrellas >= s"
                            [class.text-slate-100]="estrellas < s">
                        <i class="bi" [class.bi-star-fill]="estrellas >= s" [class.bi-star]="estrellas < s"></i>
                    </button>
                </div>

                <div class="mb-8">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Comentario (Opcional)</label>
                    <textarea [(ngModel)]="comentario" placeholder="Escribe aquí tu reseña..."
                              class="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[120px] font-medium"></textarea>
                </div>

                <button (click)="enviarResena()" 
                        [disabled]="loading || estrellas === 0"
                        class="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-500/30 hover:bg-green-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3">
                    <i class="bi bi-send-fill" *ngIf="!loading"></i>
                    <span *ngIf="!loading">ENVIAR CALIFICACIÓN Y FINALIZAR</span>
                    <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
                </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class CierreClienteComponent implements OnInit {
  private incidentesService = inject(IncidentesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  incidenteId: string = '';
  paso: 'pago' | 'calificar' = 'pago';
  monto: number = 0;
  estrellas: number = 0;
  comentario: string = '';
  loading: boolean = false;
  comprobanteSubido: boolean = false;
  metodoSeleccionado: 'qr' | 'efectivo' | 'tarjeta' = 'qr';
  tarjeta: any = { numero: '', nombre: '', exp: '', cvv: '' };

  ngOnInit() {
    this.incidenteId = this.route.snapshot.params['id'];
    this.cargarMontoReal();
  }

  cargarMontoReal() {
    this.loading = true;
    this.incidentesService.getRastreo(this.incidenteId).subscribe({
      next: (res) => {
        if (res && res.monto_total !== undefined && res.monto_total !== null) {
          this.monto = res.monto_total;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        console.error("No se pudo obtener el monto real");
        this.cdr.detectChanges();
      }
    });
  }

  pagar() {
    this.loading = true;
    this.cdr.detectChanges();
    
    // Simular el tiempo de verificación bancaria del comprobante
    const waitTime = this.metodoSeleccionado === 'qr' ? 3000 : 500;

    setTimeout(() => {
        this.incidentesService.procesarPago(this.incidenteId, this.metodoSeleccionado.toUpperCase(), this.monto).subscribe({
          next: () => {
            this.loading = false;
            this.paso = 'calificar';
            this.cdr.detectChanges();
          },
          error: () => {
            this.loading = false;
            alert('Error al procesar el pago. Intenta de nuevo.');
            this.cdr.detectChanges();
          }
        });
    }, 3000);
  }

  enviarResena() {
    this.loading = true;
    this.incidentesService.dejarResena(this.incidenteId, this.estrellas, this.comentario).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        alert('¡Gracias por tu reseña! Volviendo al historial.');
        // CORRECCIÓN: Navegación a la ruta correcta dentro del dashboard
        this.router.navigate(['/dashboard/cliente/historial']);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        alert('Error al enviar la reseña.');
      }
    });
  }
}
