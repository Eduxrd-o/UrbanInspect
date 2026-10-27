import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface WeatherData {
  temp: number;
  precipitationLastHour: number;
  hasWarning: boolean;
  error?: boolean;
}
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);

  weatherByCoords(
    latitude: number,
    longitude: number,
  ): Observable<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation&hourly=precipitation&forecast_days=1`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const hourPercipity = res.hourly?.precipitation?.[0] ?? 0;
        return {
          temp: res.current.temperature_2m,
          precipitationLastHour: hourPercipity,
          hasWarning: hourPercipity > 5.0,
        };
      }),
      catchError((e) =>
        of({
          temp: 0,
          precipitationLastHour: 0,
          hasWarning: false,
          error: true,
        }),
      ),
    );
  }
}
