import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  icidentsPage(page: number= 1, limit: number= 5): Observable <Incident[]>{
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    return this.http.get<Incident[]>(this.apiUrl, {params});
  }

  icidentCreate(incident: Incident): Observable<Incident[]>{
    return this.http.post<Incident[]>(this.apiUrl, incident);
  }

  stateIcident(id: string, estado: string, observacion: string): Observable<Incident[]>{
    return this.http.put<Incident[]>(`${this.apiUrl}/${id}`, {estado, observacion});
  }

}