import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  
  // Usamos signals para que la UI reaccione fácilmente
  public currentTenant = signal<string | null>(null);

  constructor() {
    this.detectTenant();
  }

  private detectTenant() {
    const hostname = window.location.hostname;
    
    // Si estamos en localhost, el subdominio es lo que está antes de .localhost
    // Si estamos en un dominio real (ej. midominio.com), es lo que está antes de .midominio.com
    
    const parts = hostname.split('.');
    
    if (parts.length > 1 && parts[0] !== 'www') {
      // Hay un subdominio (ej: mi-taller.localhost -> ['mi-taller', 'localhost'])
      // Excepción para dominios largos: si estamos en production, ajustar lógica.
      const subdomain = parts[0];
      
      // Lista de subdominios "reservados" que no son empresas
      const reserved = ['app', 'admin', 'www', 'api', 'localhost'];
      
      if (!reserved.includes(subdomain)) {
        this.currentTenant.set(subdomain);
        console.log(`[TenantService] Operando bajo el Tenant: ${subdomain}`);
        return;
      }
    }
    
    // Si no hay subdominio, estamos en el dominio global (Landing SaaS)
    console.log('[TenantService] Modo Global SaaS detectado.');
    this.currentTenant.set(null);
  }

  public isGlobalContext(): boolean {
    return this.currentTenant() === null;
  }

  public getTenantSlug(): string | null {
    return this.currentTenant();
  }
}
