import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { StatsService } from '../../../core/services/stats';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto animate-in">
      <header class="mb-12">
        <div class="flex items-center gap-2 mb-2">
            <span class="w-8 h-[2px] bg-amber-500"></span>
            <span class="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Auditoría de Calidad</span>
        </div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Gestión de <span class="text-amber-500 underline decoration-4 decoration-amber-100 underline-offset-8">Reputación</span>
        </h1>
      </header>

      <!-- Ranking Summary (Solo Super Admin) -->
      <div *ngIf="esSuperAdmin" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div *ngFor="let taller of ranking; let i = index" 
               class="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full"></div>
              <div class="relative z-10 text-center md:text-left">
                  <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4">Líder de Calidad #{{ i + 1 }}</span>
                  <h3 class="text-xl font-black italic tracking-tighter mb-2">{{ taller.nombre }}</h3>
                  <div class="flex items-center justify-center md:justify-start gap-3">
                      <h4 class="text-4xl font-black text-amber-400">{{ taller.promedio }}</h4>
                      <div class="flex text-amber-400 text-xs">
                          <i class="bi bi-star-fill" *ngFor="let s of [1,2,3,4,5]" [ngClass]="taller.promedio >= s ? 'text-amber-400' : 'text-white/10'"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- SECCIÓN EMPAQUETADA POR TALLER -->
      <div class="space-y-6">
          <div *ngFor="let grupo of resenasAgrupadas | keyvalue" class="animate-in">
              <!-- Card del Taller (Encabezado del Paquete) -->
              <div (click)="toggleTaller(grupo.key)" 
                   class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
                   [ngClass]="{'border-slate-900 bg-slate-50/50': tallerExpandido === grupo.key}">
                  
                  <div class="flex items-center gap-6">
                      <div class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                           [ngClass]="tallerExpandido === grupo.key ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-600'">
                          <i class="bi bi-shop text-3xl"></i>
                      </div>
                      <div>
                          <h2 class="text-xl font-black text-slate-800 uppercase tracking-tighter mb-0">{{ grupo.key }}</h2>
                          <div class="flex items-center gap-3">
                              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {{ $any(grupo.value).length }} RESEÑAS RECIBIDAS
                              </span>
                              <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <div class="flex text-amber-400 text-[10px]">
                                  <i class="bi bi-star-fill" *ngFor="let s of [1,2,3,4,5]" [ngClass]="getPromedioTaller(grupo.key) >= s ? 'text-amber-400' : 'text-slate-100'"></i>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div class="flex items-center gap-4 mt-6 md:mt-0">
                      <span class="px-5 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-500 shadow-sm uppercase tracking-widest" *ngIf="tallerExpandido !== grupo.key">
                          Expandir Feedback
                      </span>
                      <i class="bi text-2xl transition-transform duration-300" 
                         [ngClass]="tallerExpandido === grupo.key ? 'bi-chevron-up text-slate-900' : 'bi-chevron-down text-slate-300'"></i>
                  </div>
              </div>

              <!-- Listado de Reseñas del Taller (Desplegable) -->
              <div *ngIf="tallerExpandido === grupo.key" class="pt-6 pb-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in">
                  <div *ngFor="let resena of $any(grupo.value)" 
                       class="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-50 flex flex-col h-full relative group/item">
                      
                      <div class="flex justify-between items-start mb-4">
                          <div class="flex gap-0.5">
                              <i *ngFor="let s of [1,2,3,4,5]" 
                                 class="bi text-sm" 
                                 [ngClass]="resena.calificacion >= s ? 'bi-star-fill text-amber-400' : 'bi-star text-slate-100'"></i>
                          </div>
                          <span class="text-[8px] font-black text-slate-300 uppercase">{{ resena.fecha }}</span>
                      </div>

                      <p class="text-sm italic text-slate-600 font-medium mb-6 flex-grow">
                          "{{ resena.comentario || 'Sin comentarios.' }}"
                      </p>

                      <div class="flex items-center gap-3 pt-4 border-t border-slate-50">
                          <div class="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-xs">
                              <i class="bi bi-person-fill"></i>
                          </div>
                          <span class="text-[9px] font-black text-slate-900 uppercase tracking-tighter">{{ resena.cliente }}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="(resenasAgrupadas | keyvalue).length === 0" class="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
          <div class="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200 text-5xl">
              <i class="bi bi-stars"></i>
          </div>
          <h3 class="text-2xl font-black text-slate-800 mb-2 italic">Historial Limpio</h3>
          <p class="text-slate-400 font-medium">Aún no se han recibido reseñas en los talleres registrados.</p>
      </div>
    </div>
  `,
  styles: [`
    .animate-in {
      animation: fadeInSlide 0.4s ease-out;
    }
    @keyframes fadeInSlide {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ResenasComponent implements OnInit {
  private statsService = inject(StatsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  resenasAgrupadas: { [key: string]: any[] } = {};
  ranking: any[] = [];
  tallerExpandido: string | null = null;

  get esSuperAdmin() { return this.authService.currentUser?.rol === 'super_admin'; }

  ngOnInit() {
    this.cargarDatos();
  }

  toggleTaller(key: string) {
    this.tallerExpandido = this.tallerExpandido === key ? null : key;
  }

  cargarDatos() {
    this.statsService.getResenas().subscribe(res => {
      // Agrupar por taller
      this.resenasAgrupadas = {};
      res.forEach(r => {
          if (!this.resenasAgrupadas[r.taller]) {
              this.resenasAgrupadas[r.taller] = [];
          }
          this.resenasAgrupadas[r.taller].push(r);
      });

      // Calcular ranking para el encabezado
      const stats: any[] = [];
      Object.keys(this.resenasAgrupadas).forEach(key => {
          const list = this.resenasAgrupadas[key];
          const avg = list.reduce((acc, curr) => acc + curr.calificacion, 0) / list.length;
          stats.push({
              nombre: key,
              promedio: Math.round(avg * 10) / 10,
              votos: list.length
          });
      });

      this.ranking = stats.sort((a, b) => b.promedio - a.promedio).slice(0, 3);
      this.cdr.detectChanges();
    });
  }

  getPromedioTaller(taller: string): number {
      const list = this.resenasAgrupadas[taller];
      if (!list || list.length === 0) return 0;
      return list.reduce((acc, curr) => acc + curr.calificacion, 0) / list.length;
  }
}
