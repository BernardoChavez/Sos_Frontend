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
    // 1. Truco para Exámenes/Vercel: Leer el taller desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryTenant = urlParams.get('taller');

    if (queryTenant) {
      if (queryTenant === 'global') {
        localStorage.removeItem('taller_examen');
        this.currentTenant.set(null);
        console.log('[TenantService] Forzado a Modo Global SaaS.');
      } else {
        localStorage.setItem('taller_examen', queryTenant);
        this.currentTenant.set(queryTenant);
        console.log(`[TenantService] Forzado bajo el Tenant: ${queryTenant}`);
      }
      return;
    }

    // 2. Mantener el taller si ya navegamos usando el truco en Vercel
    const localTenant = localStorage.getItem('taller_examen');
    if (localTenant) {
      this.currentTenant.set(localTenant);
      console.log(`[TenantService] Recuperado Tenant de memoria: ${localTenant}`);
      return;
    }

    // 3. Comportamiento normal de subdominios (Localhost o Dominios pagados)
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 1) {
      const subdomain = parts[0];
      // Añadimos el dominio de vercel para que NO crea que es un taller
      const reserved = ['app', 'admin', 'www', 'api', 'localhost', 'sos-frontend-phi'];
      
      if (!reserved.includes(subdomain) && !hostname.includes('vercel.app')) {
        this.currentTenant.set(subdomain);
        console.log(`[TenantService] Operando bajo el Tenant: ${subdomain}`);
        return;
      }
    }
    
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
