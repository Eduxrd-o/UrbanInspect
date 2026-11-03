import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id?: string;
  version?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  bytes?: number;
  width?: number;
  height?: number;
  url?: string;
  secure_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);

  subirImagen(fileOrBase64: string | Blob): Observable<string> {
    const cloudName = (environment as any).cloudinary?.cloudName || 'dujgwv74b';
    const uploadPreset = (environment as any).cloudinary?.uploadPreset || 'urbaninspect';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', fileOrBase64);
    formData.append('upload_preset', uploadPreset);

    return this.http.post<CloudinaryUploadResponse>(url, formData).pipe(
      timeout(15000),
      map((res) => res.secure_url)
    );
  }
}
