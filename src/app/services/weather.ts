import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface WeatherData {
  temp: number;
  precipitationLastHour: number;
  hasWarning: boolean;
  condition: string;
  error?: boolean;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  private getConditionDescription(code: number): string {
    if (code === 0) return 'Cielo despejado';
    if (code === 1) return 'Mayormente despejado';
    if (code === 2) return 'Parcialmente nublado';
    if (code === 3) return 'Nublado';
    if (code === 45 || code === 48) return 'Niebla';
    if (code >= 51 && code <= 55) return 'Llovizna';
    if (code >= 61 && code <= 65) return 'Lluvia';
    if (code >= 80 && code <= 82) return 'Chubascos';
    if (code >= 95) return 'Tormenta eléctrica';
    return 'Condiciones variables';
  }

  weatherByCoords(latitude: number, longitude: number): Observable<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code&hourly=precipitation&forecast_days=1`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const hourPrecipitation = res.hourly?.precipitation?.[0] ?? res.current?.precipitation ?? 0;
        const code = res.current?.weather_code ?? 0;
        return {
          temp: res.current?.temperature_2m ?? 0,
          precipitationLastHour: hourPrecipitation,
          hasWarning: hourPrecipitation > 5.0,
          condition: this.getConditionDescription(code),
          error: false
        };
      }),
      catchError(() =>
        of({
          temp: 0,
          precipitationLastHour: 0,
          hasWarning: false,
          condition: 'No disponible',
          error: true
        })
      )
    );
  }
}
