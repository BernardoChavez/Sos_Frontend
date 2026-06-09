import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { StatsService } from '../../../core/services/stats';
import { IncidentesService } from '../../../core/services/incidentes';
import { NotificacionesService } from '../../../core/services/notificaciones';
import { OfflineSyncService } from '../../../core/services/offline-sync';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private statsService = inject(StatsService);
  private incidentesService = inject(IncidentesService);
  private notifService = inject(NotificacionesService);
  private offlineSync = inject(OfflineSyncService);
  private cdr = inject(ChangeDetectorRef);
  
  resumen: any = null;
  loading = true;
  incidenteActivo: any = null;
  notificaciones: any[] = [];
  emergenciasPendientes: number = 0;

  ngOnInit() {
    if (this.authService.currentUser) {
      this.cargarStats();
      this.verificarEmergenciaActiva();
      this.cargarNotificaciones();
      this.verificarPendientesOffline();
    } else {
      setTimeout(() => {
        this.cargarStats();
        this.verificarEmergenciaActiva();
        this.cargarNotificaciones();
        this.verificarPendientesOffline();
      }, 500);
    }
  }

  async verificarPendientesOffline() {
    if (this.authService.currentUser?.rol === 'cliente') {
      const pendings = await this.offlineSync.getPendingEmergencies();
      this.emergenciasPendientes = pendings.length;
      this.cdr.detectChanges();
    }
  }

  cargarNotificaciones() {
    const userId = this.authService.currentUser?.id;
    if (userId) {
      this.notifService.conectarWebSocket(userId);
    }
    
    this.notifService.getNotificaciones().subscribe(res => {
      this.notificaciones = res;
      this.cdr.detectChanges();
    });
  }


  verificarEmergenciaActiva() {
    if (this.authService.currentUser?.rol === 'cliente') {
      this.incidentesService.getMisSolicitudes().subscribe(res => {
        this.incidenteActivo = res.find((s: any) => 
          ['pendiente', 'asignado', 'esperando_aprobacion', 'en_camino', 'en_sitio', 'reparando'].includes(s.estado)
        );
        this.cdr.detectChanges();
      });
    }
  }

  cargarStats() {
    this.loading = true;
    this.statsService.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando dashboard:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleName(): string {
    return this.authService.currentUser?.rol?.replace('_', ' ') || 'Usuario';
  }
}
