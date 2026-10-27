import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly FOLLOW_KEY = 'incidencias_seguimiento';
  private readonly DRAFT_KEY = 'formulario_borrador';

  async toggleSeguimiento(id: string): Promise<string[]> {
    const current = await this.seguimientoIds();
    const updated = current.includes(id)? current.filter(item => item!== id): [...current, id];

    await Preferences.set({ key: this.FOLLOW_KEY, value: JSON.stringify(updated)});
    return updated;    
  }

  async seguimientoIds(): Promise<string[]>{
    const data = await Preferences.get({key: this.FOLLOW_KEY});
    return data.value? JSON.parse(data.value) : [];    
  }

  async saveBorrador(data: any): Promise<void>{
    await Preferences.set({ key: this.DRAFT_KEY, value: JSON.stringify(data)});
  }

  async borrador(): Promise<any | null>{
    const data = await Preferences.get({key: this.DRAFT_KEY});
    return data.value? JSON.parse(data.value) : null;
  }
  
  async clearBorrador(): Promise<void>{
    await Preferences.remove({key: this.DRAFT_KEY})
  }


}
