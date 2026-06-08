import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({ providedIn: 'root' })
export class TecnicosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tecnicos`;

  // --- VISTA TÉCNICO ---
  getMiPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  updateMiPerfil(data: any): Observable<any> {
    console.log('Actualizando perfil técnico:', data);
    return this.http.put(`${this.apiUrl}/perfil`, data);
  }

  // --- VISTA ADMIN ---
  getTecnicos(tallerId?: number): Observable<any[]> {
    // El backend ahora filtra automáticamente basado en el token, así que llamamos a la ruta principal
    return this.http.get<any[]>(this.apiUrl);
  }

  toggleDisponibilidad(usuarioId: number, disponible: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${usuarioId}/disponibilidad?disponible=${disponible}`, {});
  }

  actualizarUbicacion(lat: number, lng: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/perfil/ubicacion?latitud=${lat}&longitud=${lng}`, {});
  }
}
