import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'auth/login', 
    loadComponent: () => import('./modules/usuarios-vehiculos/auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'auth/register', 
    loadComponent: () => import('./modules/usuarios-vehiculos/auth/register/register').then(m => m.RegisterComponent) 
  },
  { 
    path: 'auth/recovery', 
    loadComponent: () => import('./modules/usuarios-vehiculos/auth/recovery/recovery').then(m => m.RecoveryComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./shared/layout/layout').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/trazabilidad-metricas/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./modules/trazabilidad-metricas/dashboard/notificaciones/notificaciones').then(m => m.NotificacionesFullComponent)
      },
      {
        path: 'cliente/vehiculos',
        loadComponent: () => import('./modules/usuarios-vehiculos/vehiculos/vehiculos').then(m => m.VehiculosComponent)
      },
      {
        path: 'cliente/solicitar-ayuda',
        loadComponent: () => import('./modules/registro-emergencias/solicitar-ayuda/solicitar-ayuda').then(m => m.SolicitarAyudaComponent)
      },
      {
        path: 'cliente/rastreo/:id',
        loadComponent: () => import('./modules/gestion-seguimiento/rastreo/rastreo').then(m => m.RastreoComponent)
      },
      {
        path: 'cliente/historial',
        loadComponent: () => import('./modules/trazabilidad-metricas/historial/historial').then(m => m.HistorialComponent)
      },
      {
        path: 'admin/usuarios',
        loadComponent: () => import('./modules/trazabilidad-metricas/admin/usuarios/usuarios').then(m => m.UsuariosComponent)
      },
      {
        path: 'admin/talleres',
        loadComponent: () => import('./modules/trazabilidad-metricas/admin/talleres/talleres').then(m => m.TalleresComponent)
      },
      {
        path: 'admin/roles-permisos',
        loadComponent: () => import('./modules/trazabilidad-metricas/admin/roles-permisos/roles-permisos').then(m => m.RolesPermisosComponent)
      },
      {
        path: 'admin/auditoria',
        loadComponent: () => import('./modules/trazabilidad-metricas/admin/auditoria/auditoria').then(m => m.AuditoriaComponent)
      },
      {
        path: 'admin/resenas',
        loadComponent: () => import('./modules/trazabilidad-metricas/resenas/resenas').then(m => m.ResenasComponent)
      },
      {
        path: 'taller/tecnicos',
        loadComponent: () => import('./modules/talleres-tecnicos/tecnicos/tecnicos').then(m => m.TecnicosComponent)
      },
      {
        path: 'taller/despacho',
        loadComponent: () => import('./modules/atencion-solicitudes/despacho/despacho').then(m => m.DespachoComponent)
      },
      {
        path: 'taller/configuracion',
        loadComponent: () => import('./modules/talleres-tecnicos/configuracion/configuracion').then(m => m.ConfiguracionTallerComponent)
      },
      {
        path: 'taller/historial',
        loadComponent: () => import('./modules/trazabilidad-metricas/historial/historial').then(m => m.HistorialComponent)
      },
      {
        path: 'cliente/cierre/:id',
        loadComponent: () => import('./modules/pagos-cliente/cierre/cierre').then(m => m.CierreClienteComponent)
      },
      {
        path: 'tecnico/mis-trabajos',
        loadComponent: () => import('./modules/atencion-solicitudes/tecnico/mis-trabajos/mis-trabajos').then(m => m.MisTrabajosComponent)
      },
      {
        path: 'tecnico/asistencia/:id',
        loadComponent: () => import('./modules/atencion-solicitudes/tecnico/asistencia/asistencia').then(m => m.AsistenciaTecnicoComponent)
      },
      {
        path: 'tecnico/historial',
        loadComponent: () => import('./modules/trazabilidad-metricas/historial/historial').then(m => m.HistorialComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./modules/usuarios-vehiculos/usuarios/perfil/perfil').then(m => m.PerfilComponent)
      }
    ]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];