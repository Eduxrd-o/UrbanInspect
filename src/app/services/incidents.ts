import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timeout, tap, catchError } from 'rxjs';

export interface Incident {
  id?: string;
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;
  estado: 'pendiente' | 'en proceso' | 'resuelta';
  prioridad: 'baja' | 'media' | 'alta';
  foto?: string;
  latitud?: number;
  longitud?: number;
  observacion?: string;
}

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private http = inject(HttpClient);
  private apiUrl = 'https://6ae10789be3bc8fead982fed.mockapi.io/api/v1/Incidents';
  private cachedIncidents: Incident[] = [];

  incidentsPage(page: number = 1, limit: number = 5): Observable<Incident[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', 'fecha')
      .set('order', 'desc');
    return this.http.get<Incident[]>(this.apiUrl, { params }).pipe(
      timeout(6000),
      tap(items => {
        if (Array.isArray(items)) {
          for (const item of items) {
            const idx = this.cachedIncidents.findIndex(c => String(c.id) === String(item.id));
            if (idx >= 0) {
              this.cachedIncidents[idx] = item;
            } else {
              this.cachedIncidents.push(item);
            }
          }
        }
      })
    );
  }

  getIncidentById(id: string): Observable<Incident> {
    const cached = this.cachedIncidents.find(c => String(c.id) === String(id));
    if (cached) {
      return of(cached);
    }
    return this.http.get<Incident>(`${this.apiUrl}/${id}`).pipe(
      timeout(6000),
      tap(item => {
        if (item && item.id) {
          const idx = this.cachedIncidents.findIndex(c => String(c.id) === String(item.id));
          if (idx >= 0) this.cachedIncidents[idx] = item;
          else this.cachedIncidents.push(item);
        }
      })
    );
  }

  incidentCreate(incidencia: Incident): Observable<Incident> {
    return this.http.post<Incident>(this.apiUrl, incidencia).pipe(
      timeout(8000),
      tap(created => {
        if (created) {
          this.cachedIncidents.unshift(created);
        }
      })
    );
  }

  statusUpdate(id: string, estado: string, observacion?: string): Observable<Incident> {
    const body: any = { estado };
    if (observacion !== undefined) {
      body.observacion = observacion;
    }
    return this.http.put<Incident>(`${this.apiUrl}/${id}`, body).pipe(
      timeout(6000),
      tap(updated => {
        if (updated) {
          const idx = this.cachedIncidents.findIndex(c => String(c.id) === String(id));
          if (idx >= 0) this.cachedIncidents[idx] = updated;
        }
      })
    );
  }
}
