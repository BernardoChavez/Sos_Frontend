import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class IncidentesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getMisSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/emergencias/cliente/mis-solicitudes`);
  }

  solicitarEmergencia(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/emergencias/solicitar/`, formData);
  }

  subirEvidencia(incidenteId: string, tipo: 'foto' | 'audio', file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/emergencias/cliente/${incidenteId}/evidencias/?tipo=${tipo}`, formData);
  }

  getMisTrabajosTecnico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/tecnico/mis-trabajos`);
  }

  getHistorialTecnico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/tecnico/historial`);
  }

  getSolicitudesTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/taller/${tallerId}/solicitudes`);
  }

  getHistorialTaller(tallerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/taller/${tallerId}/historial`);
  }

  getHistorialEmpresa(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/incidentes/empresa/historial`);
  }

  gestionarIncidente(incidenteId: string, accion: 'aceptar' | 'rechazar', tecnicoId?: number): Observable<any> {
    let url = `${this.baseUrl}/incidentes/${incidenteId}/gestionar/?accion=${accion}`;
    if (tecnicoId) url += `&tecnico_id=${tecnicoId}`;
    return this.http.patch<any>(url, {});
  }

  // --- CICLO 3: GESTIÓN, PAGOS Y RESEÑAS ---
  actualizarEstadoGestion(id: string, estado: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/incidentes/${id}/trazabilidad?estado_nuevo=${estado}`, {});
  }

  procesarPago(id: string, metodo: string, monto: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/incidentes/${id}/pagos?metodo=${metodo}&monto=${monto}`, {});
  }

  confirmarPagoEfectivo(id: string, montoRecibido: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/incidentes/${id}/pagos/confirmar-efectivo?monto_recibido=${montoRecibido}`, {});
  }

  dejarResena(id: string, calificacion: number, comentario: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/emergencias/cliente/${id}/calificar?calificacion=${calificacion}&comentario=${comentario}`, {});
  }

  // Alias para compatibilidad con componentes viejos
  calificarServicio(id: string, calificacion: number, comentario: string): Observable<any> {
    return this.dejarResena(id, calificacion, comentario);
  }

  getRastreo(incidenteId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/emergencias/cliente/${incidenteId}/rastreo/`);
  }

  finalizarServicio(incidenteId: string, diagnostico: string, monto: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/incidentes/${incidenteId}/finalizar?diagnostico=${diagnostico}&monto=${monto}`, {});
  }

  empezarReparacion(incidenteId: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/incidentes/${incidenteId}/reparar`, {});
  }

  enviarCotizacion(id: string, monto: number, detalle: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/incidentes/${id}/enviar-cotizacion`, { monto, detalle });
  }

  responderCotizacion(id: string, aceptada: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/emergencias/cliente/${id}/responder-cotizacion`, { aceptada });
  }

  getReportePDF(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/incidentes/${id}/reporte`);
  }
}
