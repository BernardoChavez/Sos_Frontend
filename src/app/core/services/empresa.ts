import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = environment.apiUrl + '/empresas';

  constructor(private http: HttpClient) { }

  registrarEmpresa(empresaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, empresaData);
  }

  obtenerPlanes(): Observable<any> {
    // Para simplificar, en este momento el SaaS mockeará los planes, 
    // pero idealmente vendrían del backend.
    return new Observable(obs => {
      obs.next([
        { id: 1, nombre: 'Básico', precio: 0, limite_talleres: 1, limite_tecnicos: 5 },
        { id: 2, nombre: 'Pro', precio: 79.99, limite_talleres: 3, limite_tecnicos: 20 },
        { id: 3, nombre: 'Enterprise', precio: 199.99, limite_talleres: 10, limite_tecnicos: 20 },
      ]);
      obs.complete();
    });
  }
}
