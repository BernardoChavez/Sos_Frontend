import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing.html',
  styles: [`
    .glass-nav {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hero-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(15,23,42,0) 70%);
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }
  `]
})
export class LandingComponent implements OnInit {
  
  empresas: any[] = [];
  empresaSeleccionada: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/empresas`).subscribe({
      next: (data) => this.empresas = data,
      error: (err) => console.error('Error cargando empresas:', err)
    });
  }

  irAEmpresa() {
    if (this.empresaSeleccionada) {
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const protocol = window.location.protocol;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // En entorno local redirigimos a subdominio.localhost
        window.location.href = `${protocol}//${this.empresaSeleccionada}.localhost${port}/auth/login`;
      } else {
        // En producción: eliminamos 'www.' si existe y armamos el subdominio
        const baseDomain = hostname.replace('www.', '');
        window.location.href = `${protocol}//${this.empresaSeleccionada}.${baseDomain}${port}/auth/login`;
      }
    }
  }

  irAPlanes() {
    this.router.navigate(['/planes']);
  }

  iniciarSesion() {
    this.router.navigate(['/auth/login']);
  }

  pedirAuxilio() {
    this.router.navigate(['/cliente/solicitar-ayuda']);
  }
}
