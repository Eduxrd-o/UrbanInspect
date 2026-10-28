import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonInput,
  IonButton,
  IonIcon,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, trash, location, cloudyNight, warning, save, locate, chevronForward, add } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { StorageService } from '../../services/storage';
import { WeatherData, WeatherService } from '../../services/weather';
import { IncidentService } from '../../services/incidents';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonInput,
    IonButton,
    IonIcon,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonSpinner
  ]
})
export class RegistroPage implements OnInit {

  private fb = inject(FormBuilder);
  private weatherService = inject(WeatherService);
  private IncidentService = inject(IncidentService);
  private storageService = inject(StorageService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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

  private borradorChecked = false;

  ngOnInit() {
    this.form.valueChanges.subscribe(val => {
      if (this.form.dirty) this.storageService.saveBorrador(val);
    });

    this.route.queryParams.subscribe(async (params) => {
      if (params['ubicacion'] === 'gps') {
        await this.obtenerUbicacion();
      } else if (params['ubicacion'] === 'manual') {
        this.solicitarCoordenadasManuales();
      }
    });
  }

  async ionViewWillEnter() {
    if (!this.borradorChecked) {
      const borrador = await this.storageService.borrador();
      if (borrador && Object.values(borrador).some(v => v !== '' && v !== null && v !== 'media')) {
        const alert = await this.alertCtrl.create({
          header: 'Registro Incompleto',
          message: 'Se encontró un borrador previo no guardado. ¿Deseas recuperar los datos ingresados?',
          buttons: [
            {
              text: 'Descartar',
              role: 'cancel',
              handler: async () => {
                await this.storageService.clearBorrador();
                this.form.reset({ prioridad: 'media' });
              }
            },
            {
              text: 'Continuar',
              handler: () => {
                this.form.patchValue(borrador);
                if (borrador.latitud && borrador.longitud) {
                  this.consultarClima(borrador.latitud, borrador.longitud);
                }
              }
            }
          ]
        });
        await alert.present();
      }
      this.borradorChecked = true;
    }
  }

  ionViewWillLeave() {
    this.borradorChecked = false;
  }

  constructor() {
    addIcons({ camera, trash, location, 'cloudy-night': cloudyNight, cloudyNight, warning, save, locate, 'chevron-forward': chevronForward, chevronForward, add });
  }
  async capturarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 45,
        width: 600,
        height: 600,
        correctOrientation: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      if (image?.base64String) {
        const raw = `data:image/jpeg;base64,${image.base64String}`;
        const compressed = await this.comprimirImagen(raw, 600, 0.45);
        this.form.patchValue({ foto: compressed });
      }
    } catch (e) {
      this.abrirSelectorArchivo();
    }
  }

  abrirSelectorArchivo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const raw = reader.result as string;
          const compressed = await this.comprimirImagen(raw, 600, 0.45);
          this.form.patchValue({ foto: compressed });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  private comprimirImagen(dataUrl: string, maxWidth = 600, quality = 0.45): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  limpiarFoto() {
    this.form.patchValue({ foto: '' });
  }

  async obtenerUbicacion() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      this.form.patchValue({ latitud: pos.coords.latitude, longitud: pos.coords.longitude });
      this.consultarClima(pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      this.solicitarCoordenadasManuales();
    }
  }

  consultarClima(lat: number, lng: number) {
    this.weatherService.weatherByCoords(lat, lng).subscribe(data => this.climaData = data);
  }

  async solicitarCoordenadasManuales() {
    const alert = await this.alertCtrl.create({
      header: 'Coordenadas Requeridas',
      message: 'Ingrese latitud y longitud:',
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

  isSaving = false;

  async guardar() {
    if (this.isSaving) return;

    if (this.form.invalid) {
      const faltantes: string[] = [];
      if (!this.form.get('tipo')?.value) faltantes.push('Tipo de Incidencia');
      if (!this.form.get('sector')?.value) faltantes.push('Sector o Parroquia');
      if (!this.form.get('descripcion')?.value) faltantes.push('Descripción del Problema');

      const mensaje = faltantes.length > 0
        ? `Por favor completa los siguientes campos: ${faltantes.join(', ')}.`
        : 'Por favor completa todos los campos requeridos (*).';

      await this.mostrarToast(mensaje, 'warning');
      return;
    }

    const val = this.form.value;

    if (val.prioridad === 'alta' && !val.foto) {
      await this.mostrarToast('R5: La fotografía es obligatoria para incidencias de prioridad alta.', 'danger');
      return;
    }

    if (val.tipo === 'bache' && (!val.latitud || !val.longitud)) {
      await this.mostrarToast('La ubicación GPS o manual es obligatoria para baches.', 'danger');
      await this.solicitarCoordenadasManuales();
      return;
    }

    this.isSaving = true;
    let fotoFinal = val.foto;
    if (fotoFinal && typeof fotoFinal === 'string' && fotoFinal.startsWith('data:image')) {
      fotoFinal = await this.comprimirImagen(fotoFinal, 600, 0.45);
    }
    const payload = {
      ...val,
      foto: fotoFinal,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };

    this.IncidentService.incidentCreate(payload).subscribe({
      next: async () => {
        await this.storageService.clearBorrador();
        this.isSaving = false;
        await this.mostrarToast('Incidencia registrada con éxito en el sistema.', 'success');
        this.router.navigate(['/incidents-list']);
      },
      error: async (err) => {
        console.error('Error al guardar incidencia:', err);
        this.isSaving = false;
        await this.mostrarToast('Error al conectar con la oficina. Revisa tu conexión a internet.', 'danger');
      }
    });
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.alertCtrl.create({
      header: color === 'danger' ? 'Atención Requerida' : (color === 'warning' ? 'Campo Incompleto' : 'Confirmación'),
      message: mensaje,
      buttons: ['Aceptar']
    });
    await toast.present();
    await toast.onDidDismiss();
  }
}
