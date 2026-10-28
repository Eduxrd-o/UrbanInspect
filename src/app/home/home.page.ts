import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  IonHeader,
  IonContent,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonFooter,
  IonModal,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  list,
  add,
  bookmark,
  bookmarkOutline,
  alertCircle,
  construct,
  checkmarkCircle,
  refreshOutline,
  cloudyNight,
  water,
  thermometer,
  arrowForward,
  warning,
  shieldCheckmark,
  notificationsOutline,
  personCircleOutline,
  speedometerOutline,
  warningOutline,
  buildOutline,
  checkmarkCircleOutline,
  locationOutline,
  heart,
  heartOutline,
  timeOutline,
  cloudyOutline,
  flashlightOutline,
  close,
  locate,
  chevronForward,
  home,
  calendarOutline,
} from 'ionicons/icons';
import { IncidentService, Incident } from '../services/incidents';
import { WeatherService, WeatherData } from '../services/weather';
import { StorageService } from '../services/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonContent,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonFooter,
    IonModal,
  ],
})
export class HomePage implements OnInit {
  private incidentService = inject(IncidentService);
  private weatherService = inject(WeatherService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  totalCount = 0;
  pendientesCount = 0;
  enProcesoCount = 0;
  resueltasCount = 0;

  recentIncidents: Incident[] = [];
  seguimientosIds: string[] = [];
  fechaHoy: Date = new Date();

  isLoading = false;
  climaQuito: WeatherData | null = null;
  climaError = false;

  mostrarModalRegistroRapido = false;

  abrirModalRegistroRapido() {
    this.mostrarModalRegistroRapido = true;
  }

  cerrarModalRegistroRapido() {
    this.mostrarModalRegistroRapido = false;
  }

  seleccionarModoUbicacion(modo: 'gps' | 'manual') {
    this.mostrarModalRegistroRapido = false;
    this.router.navigate(['/registro'], {
      queryParams:
        modo === 'gps' ? { ubicacion: 'gps' } : { ubicacion: 'manual' },
    });
  }

  constructor() {
    addIcons({
      refreshOutline,
      add,
      speedometerOutline,
      warningOutline,
      buildOutline,
      checkmarkCircleOutline,
      arrowForward,
      locationOutline,
      cloudyOutline,
      warning,
      home,
      list,
      bookmark,
      close,
      locate,
      chevronForward,
      bookmarkOutline,
      alertCircle,
      construct,
      checkmarkCircle,
      cloudyNight,
      water,
      thermometer,
      shieldCheckmark,
      notificationsOutline,
      personCircleOutline,
      heart,
      heartOutline,
      timeOutline,
      flashlightOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async ionViewWillEnter() {
    this.seguimientosIds = await this.storageService.seguimientoIds();
    this.cargarDatos();
  }

  async cargarDatos(event?: any) {
    this.isLoading = !event;
    this.seguimientosIds = await this.storageService.seguimientoIds();
    this.cargarIndicadores(event);
    this.cargarClima();
  }

  cargarIndicadores(event?: any) {
    this.incidentService.incidentsPage(1, 100).subscribe({
      next: (data: Incident[]) => {
        this.totalCount = data.length;
        this.pendientesCount = data.filter(
          (i) => (i.estado || '').toLowerCase() === 'pendiente',
        ).length;
        this.enProcesoCount = data.filter(
          (i) => (i.estado || '').toLowerCase() === 'en proceso',
        ).length;
        this.resueltasCount = data.filter(
          (i) => (i.estado || '').toLowerCase() === 'resuelta',
        ).length;
        this.recentIncidents = data.slice(0, 4);
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.isLoading = false;
        if (event) event.target.complete();
      },
    });
  }

  cargarClima() {
    this.weatherService.weatherByCoords(-0.1807, -78.4678).subscribe({
      next: (data) => {
        this.climaQuito = data;
        this.climaError = false;
      },
      error: () => {
        this.climaError = true;
      },
    });
  }

  async toggleSeguimiento(id: string, event: Event) {
    event.stopPropagation();
    this.seguimientosIds = await this.storageService.toggleSeguimiento(id);
  }

  esSeguimiento(id: string): boolean {
    return this.seguimientosIds.includes(id);
  }

  handleRefresh(event: any) {
    this.cargarDatos(event);
  }

  colorEstado(estado?: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'resuelta':
        return 'success';
      case 'en proceso':
        return 'primary';
      case 'pendiente':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getIconoPorTipo(tipo?: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('luminaria')) return 'flashlight-outline';
    if (t.includes('bache')) return 'warning-outline';
    if (t.includes('señal')) return 'construct';
    if (t.includes('alcantarilla')) return 'water';
    return 'alert-circle';
  }
}
