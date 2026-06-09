import { Injectable, inject } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IncidentesService } from './incidentes';

interface SOSDB extends DBSchema {
  emergencies: {
    key: number;
    value: {
      id?: number;
      vehiculo_id: string;
      latitud: string;
      longitud: string;
      archivos: File[];
      createdAt: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {
  private dbPromise: Promise<IDBPDatabase<SOSDB>>;
  private incidentesService = inject(IncidentesService);

  constructor() {
    this.dbPromise = openDB<SOSDB>('sos-automotriz-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('emergencies')) {
          db.createObjectStore('emergencies', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });

    this.initSyncListener();
  }

  private initSyncListener() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexión recuperada. Intentando sincronizar emergencias pendientes...');
      this.syncPendingEmergencies();
    });
  }

  async syncPendingEmergencies() {
    const pendings = await this.getPendingEmergencies();
    if (pendings.length === 0) return;

    for (const emergency of pendings) {
      if (!emergency.id) continue;
      
      const formData = new FormData();
      formData.append('vehiculo_id', emergency.vehiculo_id);
      formData.append('latitud', emergency.latitud);
      formData.append('longitud', emergency.longitud);
      
      if (emergency.archivos && emergency.archivos.length > 0) {
        emergency.archivos.forEach(f => {
          if (f.type.includes('audio')) {
            formData.append('audio', f);
          } else {
            formData.append('foto', f);
          }
        });
      }

      this.incidentesService.solicitarEmergencia(formData).subscribe({
        next: () => {
          console.log(`✅ Emergencia ${emergency.id} sincronizada correctamente.`);
          this.deleteEmergency(emergency.id!);
          // Refrescar página para actualizar el dashboard y mostrar el mapa
          window.location.reload(); 
        },
        error: (err) => {
          console.error(`❌ Error al sincronizar emergencia ${emergency.id}:`, err);
        }
      });
    }
  }

  async saveEmergency(data: { vehiculo_id: string, latitud: string, longitud: string, archivos: File[] }) {
    const db = await this.dbPromise;
    return db.add('emergencies', {
      ...data,
      createdAt: Date.now()
    });
  }

  async getPendingEmergencies() {
    const db = await this.dbPromise;
    return db.getAll('emergencies');
  }

  async deleteEmergency(id: number) {
    const db = await this.dbPromise;
    return db.delete('emergencies', id);
  }
}
