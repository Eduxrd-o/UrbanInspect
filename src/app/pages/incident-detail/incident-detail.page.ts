import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService, Incident } from '../../services/incidents';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  location,
  calendar,
  alertCircle,
  construct,
  checkmarkCircle,
  checkmarkDone,
  imageOutline,
  chatbubbleEllipses,
  timeOutline,
  navigateOutline,
  flashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  templateUrl: './incident-detail.page.html',
  styleUrls: ['./incident-detail.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner
  ]
})
export class IncidentDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private incidentService = inject(IncidentService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  incident: Incident | null = null;
  isLoading = true;
  errorMessage = '';

  constructor() {
    addIcons({
      arrowBack,
      location,
      calendar,
      alertCircle,
      construct,
      checkmarkCircle,
      checkmarkDone,
      imageOutline,
      chatbubbleEllipses,
      timeOutline,
      navigateOutline,
      flashOutline
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarDetalle(id);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Identificador de incidencia no proporcionado.';
      }
    });
  }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && (!this.incident || this.incident.id !== id)) {
      this.cargarDetalle(id);
    }
  }

  cargarDetalle(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.incidentService.getIncidentById(id).subscribe({
      next: (item) => {
        this.incident = item;
        this.isLoading = false;
      },
      error: () => {
        this.incidentService.incidentsPage(1, 100).subscribe({
          next: (list) => {
            this.incident = list.find(i => String(i.id) === String(id)) || null;
            this.isLoading = false;
            if (!this.incident) {
              this.errorMessage = 'No se encontró la incidencia solicitada.';
            }
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Error de conexión al cargar la incidencia.';
          }
        });
      }
    });
  }


  async pasarAEnProceso() {
    if (!this.incident?.id || this.incident.estado !== 'pendiente') return;

    const alert = await this.alertCtrl.create({
      header: 'Iniciar Atención',
      message: '¿Deseas marcar esta incidencia como «En Proceso» de atención técnica?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.incidentService.statusUpdate(this.incident!.id!, 'en proceso').subscribe({
              next: (res) => {
                this.incident = res;
                this.mostrarToast('Incidencia actualizada a «En Proceso».');
              },
              error: () => this.mostrarToast('Error al actualizar el estado.', 'danger')
            });
          }
        }
      ]
    });
    await alert.present();
  }


  async resolver() {
    if (!this.incident?.id || this.incident.estado === 'resuelta') return;

    const alert = await this.alertCtrl.create({
      header: 'Resolver Incidencia',
      subHeader: 'Requisito R9: Ingrese la observación de resolución obligatoria.',
      inputs: [
        {
          name: 'obs',
          type: 'textarea',
          placeholder: 'Detalle del trabajo realizado o solución aplicada...'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar Resolución',
          handler: (d) => {
            if (!d.obs || !d.obs.trim()) {
              this.mostrarToast('La observación es obligatoria para resolver la incidencia.', 'warning');
              return false;
            }

            this.incidentService.statusUpdate(this.incident!.id!, 'resuelta', d.obs.trim()).subscribe({
              next: (res) => {
                this.incident = res;
                this.mostrarToast('Incidencia marcada como Resuelta exitosamente.');
              },
              error: () => this.mostrarToast('Error al guardar la resolución.', 'danger')
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  colorEstado(estado?: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'resuelta': return 'success';
      case 'en proceso': return 'warning';
      case 'pendiente': return 'danger';
      default: return 'medium';
    }
  }

  colorPrioridad(prioridad?: string): string {
    switch ((prioridad || '').toLowerCase()) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'medium';
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}