import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/empresas/`;
  private suscripcionesUrl = `${environment.apiUrl}/suscripciones/`;

  // List all companies
  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get detailed info of a company (includes subscription)
  getEmpresaDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}`);
  }

  // Get tenant subdomain (schema name)
  getSubdominio(id: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}${id}/subdominio`);
  }

  // List all subscription plans
  getSuscripciones(): Observable<any[]> {
    return this.http.get<any[]>(this.suscripcionesUrl);
  }

  // Create subscription plan
  crearSuscripcion(data: any): Observable<any> {
    return this.http.post<any>(this.suscripcionesUrl, data);
  }

  // Update subscription plan
  actualizarSuscripcion(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.suscripcionesUrl}${id}`, data);
  }

  // Delete subscription plan
  eliminarSuscripcion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.suscripcionesUrl}${id}`);
  }

  // --- DASHBOARD METRICS ---
  getDashboardKpis(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/dashboard/kpis`);
  }

  getDashboardIncidentesRecientes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/incidentes-recientes`);
  }

  getDashboardSlaFlow(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/sla-flow`);
  }
}
