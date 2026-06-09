import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresasService } from '../../../core/services/empresas.service';
import { timeout } from 'rxjs/operators';
import * as L from 'leaflet';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadmin.html',
  styles: ``
})
export class SuperadminComponent implements OnInit {
  private empresasService = inject(EmpresasService);
  
  empresas = signal<any[]>([]);
  suscripciones = signal<any[]>([]);
  
  loadingEmpresas = signal(true);
  errorEmpresas = signal('');

  loadingSuscripciones = signal(true);
  errorSuscripciones = signal('');

  // Dashboard signals
  kpis = signal<any>(null);
  incidentesRecientes = signal<any[]>([]);
  incidentesFiltrados = signal<any[]>([]);
  categoriasDisponibles = signal<string[]>(['Todos']);
  categoriaSeleccionada = signal<string>('Todos');
  
  slaFlow = signal<any[]>([]);
  loadingDashboard = signal(true);
  
  map: L.Map | undefined;

  ngOnInit() {
    this.cargarDashboard();
    this.cargarEmpresas();
    this.cargarSuscripciones();
  }

  cargarDashboard() {
    this.empresasService.getDashboardKpis().subscribe({
      next: (data) => this.kpis.set(data),
      error: (err) => console.error(err)
    });

    this.empresasService.getDashboardIncidentesRecientes().subscribe({
      next: (data) => {
        this.incidentesRecientes.set(data);
        
        // Extraer categorías únicas
        const catSet = new Set<string>();
        data.forEach((inc: any) => { if (inc.categoria) catSet.add(inc.categoria); });
        this.categoriasDisponibles.set(['Todos', ...Array.from(catSet)]);
        
        this.filtrarPorCategoria('Todos');
        setTimeout(() => this.initMap(), 500); // Dar tiempo a que el div renderice
      },
      error: (err) => console.error(err)
    });

    this.empresasService.getDashboardSlaFlow().subscribe({
      next: (data) => {
        this.slaFlow.set(data);
        this.loadingDashboard.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loadingDashboard.set(false);
      }
    });
  }

  cargarEmpresas() {
    this.empresasService.getEmpresas()
      .subscribe({
        next: (data: any) => {
          this.empresas.set(Array.isArray(data) ? data : (data.value ?? []));
          this.loadingEmpresas.set(false);
        },
        error: (err: any) => {
          this.errorEmpresas.set('No se pudieron cargar las empresas.');
          this.loadingEmpresas.set(false);
          console.error(err);
        }
      });
  }

  cargarSuscripciones() {
    this.empresasService.getSuscripciones()
      .subscribe({
        next: (data: any) => {
          this.suscripciones.set(Array.isArray(data) ? data : (data.value ?? []));
          this.loadingSuscripciones.set(false);
        },
        error: (err: any) => {
          this.errorSuscripciones.set('No se pudieron cargar las suscripciones.');
          this.loadingSuscripciones.set(false);
          console.error(err);
        }
      });
  }

  filtrarPorCategoria(cat: string) {
    this.categoriaSeleccionada.set(cat);
    if (cat === 'Todos') {
      this.incidentesFiltrados.set(this.incidentesRecientes());
    } else {
      this.incidentesFiltrados.set(this.incidentesRecientes().filter(i => i.categoria === cat));
    }
    // Repintar mapa con los nuevos filtros
    if (this.map) {
      this.initMap();
    }
  }

  initMap() {
    const container = document.getElementById('heatmap');
    if (!container) return;
    
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('heatmap').setView([-17.3895, -66.1568], 12); // Centro Cochabamba aprox.
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const customIcon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
               <div class="w-2 h-2 bg-white rounded-full"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const incidentes = this.incidentesFiltrados();
    incidentes.forEach(inc => {
      if (inc.latitud && inc.longitud) {
        L.marker([inc.latitud, inc.longitud], { icon: customIcon })
          .addTo(this.map!)
          .bindPopup(`<b>${inc.categoria}</b><br>${inc.ubicacion}`);
      }
    });
  }

  cerrarSesion() {
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    window.location.href = '/auth/login';
  }
}
