import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController} from '@ionic/angular';
import { StorageService } from '../../services/storage';
import { WeatherData, WeatherService } from '../../services/weather';
import { IncidentService } from '../../services/incidents';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RegistroPage implements OnInit {

  private fb = inject(FormBuilder);
  private weatherService = inject(WeatherService);
  private IncidentService = inject(IncidentService);
  private storageService = inject(StorageService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  climaData: WeatherData | null = null;

  form: FormGroup = this.fb.group({
    tipo: ['', Validators.required],
    descripcion: ['', Validators.required],
    direccion: [''],
    sector: ['', Validators.required],
    prioridad: ['media', Validators.required],
    foto: [''],
    latitud: [null],
    longitud: [null]
  });

  async ngOnInit() {
    const borrador = await this.storageService.borrador();
    if(borrador){
      const alert = await this.alertCtrl.create({
        header: 'Registro Borrador',
        message: '¿Deseas recuperar la información del registro inconcluso?',
        buttons: [
          { text: 'Descartar', role: 'cancel', handler: () => this.storageService.clearBorrador() },
          { text: 'Continuar', handler: () => this.form.patchValue(borrador) }
        ]
      });
      await alert.present();
    }

    this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) this.storageService.saveBorrador(val);
    });
  }

  async guardarFoto(){
    try{
      const image = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
    });
    if (image.base64String) {
      this.form.patchValue({ foto: `data:image/jpeg;base64,${image.base64String}`});      
      }
    } catch (e){
   }
  }

  async obtenerUbicacion() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      this.form.patchValue({ latitud: pos.coords.latitude, longitud: pos.coords.longitude });
      this.consultarClima(pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      if (this.form.get('tipo')?.value === 'bache') {
        this.solicitarCoordenadasManuales();
      }
    }
  }

  consultarClima(lat: number, lng: number) {
    this.weatherService.weatherByCoords(lat, lng).subscribe(data => this.climaData = data);
  }

  async solicitarCoordenadasManuales() {
    const alert = await this.alertCtrl.create({
      header: 'Coordenadas Requeridas',
      message: 'Ingrese latitud y longitud para la incidencia de tipo bache:',
      inputs: [
        { name: 'lat', type: 'number', placeholder: 'Latitud (-0.21)' },
        { name: 'lng', type: 'number', placeholder: 'Longitud (-78.50)' }
      ],
      buttons: [{
        text: 'Aceptar',
        handler: (d) => {
          if (d.lat && d.lng) {
            const lat = parseFloat(d.lat);
            const lng = parseFloat(d.lng);
            this.form.patchValue({ latitud: lat, longitud: lng });
            this.consultarClima(lat, lng);
          }
        }
      }]
    });
    await alert.present();
  }

  async guardar() {
    if (this.form.invalid) return;
    const val = this.form.value;

    if (val.prioridad === 'alta' && !val.foto) {
      alert('Foto obligatoria para prioridad alta.');
      return;
    }
    if (val.tipo === 'bache' && !val.latitud) {
      alert('Ubicación requerida para baches.');
      return;
    }

    const payload = { ...val, fecha: new Date().toISOString(), estado: 'pendiente' };
    this.IncidentService.icidentCreate(payload).subscribe(async () => {
      await this.storageService.clearBorrador();
      this.router.navigate(['/listado']);
    });
  }
}
