import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { IncidentService, Incident } from '../../services/incidents';
import { StorageService } from '../../services/storage';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner
} from '@ionic/angular';
import {
  bookmark,
  bookmarkOutline,
  add,
  searchOutline,
  filterOutline,
  locationOutline,
  calendarOutline,
  alertCircleOutline,
  refreshOutline,
  checkmarkCircleOutline,
  timeOutline,
  arrowBack,
  heart,
  heartOutline,
  flashlightOutline,
  construct,
  water,
  alertCircle
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  templateUrl: './incidents-list.page.html',
  styleUrls: ['./incidents-list.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonBackButton,
    IonIcon,
    IonLabel,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner
  ]
})
export class IncidentsListPage implements OnInit {
  private incidentService = inject(IncidentService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  incidents: Incident[] = [];
  seguimientosIds: string[] = [];
  currentPage = 1;
  pageSize = 10;
  hasMoreData = true;
  isLoading = false;
  isLoadingError = false;

  filtroEstado: string = 'todas';
  terminoBusqueda: string = '';

  constructor() {
    addIcons({
      bookmark,
      bookmarkOutline,
      add,
      searchOutline,
      filterOutline,
      locationOutline,
      calendarOutline,
      alertCircleOutline,
      refreshOutline,
      checkmarkCircleOutline,
      timeOutline,
      arrowBack,
      heart,
      heartOutline,
      flashlightOutline,
      construct,
      water,
      alertCircle
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['filtro']) {
        this.filtroEstado = params['filtro'];
      }
    });
  }

  async ionViewWillEnter() {
    await this.cargarSeguimientos();
    this.paginaInicial();
  }

  async cargarSeguimientos() {
    this.seguimientosIds = await this.storageService.seguimientoIds();
    for (const id of this.seguimientosIds) {
      if (!this.incidents.some(i => i.id === id)) {
        this.incidentService.getIncidentById(id).subscribe({
          next: (inc) => {
            if (inc && !this.incidents.some(i => i.id === inc.id)) {
              this.incidents.push(inc);
            }
          },
          error: () => {}
        });
      }
    }
  }

  paginaInicial(event?: any) {
    this.currentPage = 1;
    this.hasMoreData = true;
    this.isLoadingError = false;
    this.isLoading = !event;

    this.incidentService.incidentsPage(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.incidents = data;
        this.isLoading = false;
        if (data.length < this.pageSize) this.hasMoreData = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingError = true;
        if (event) event.target.complete();
      }
    });
  }

  cargarMasPaginas(event: InfiniteScrollCustomEvent) {
    if (!this.hasMoreData) {
      event.target.disabled = true;
      return;
    }

    this.currentPage++;
    this.incidentService.incidentsPage(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data.length === 0 || data.length < this.pageSize) {
          this.hasMoreData = false;
          event.target.disabled = true;
        }
        this.incidents = [...this.incidents, ...data];
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  handleRefresh(event: any) {
    this.cargarSeguimientos();
    this.paginaInicial(event);
  }

  async toggleSeguimiento(id: string, event: Event) {
    event.stopPropagation();
    this.seguimientosIds = await this.storageService.toggleSeguimiento(id);
  }

  esSeguimiento(id: string): boolean {
    return this.seguimientosIds.includes(id);
  }

  get incidenciasFiltradas(): Incident[] {
    return this.incidents.filter(item => {

      if (this.filtroEstado === 'seguimiento') {
        if (!this.esSeguimiento(item.id!)) return false;
      } else if (this.filtroEstado !== 'todas') {
        if ((item.estado || '').toLowerCase() !== this.filtroEstado.toLowerCase()) {
          return false;
        }
      }


      if (this.terminoBusqueda.trim()) {
        const query = this.terminoBusqueda.toLowerCase().trim();
        const coincideTipo = (item.tipo || '').toLowerCase().includes(query);
        const coincideSector = (item.sector || '').toLowerCase().includes(query);
        const coincideDesc = (item.descripcion || '').toLowerCase().includes(query);
        const coincideDir = (item.direccion || '').toLowerCase().includes(query);
        if (!coincideTipo && !coincideSector && !coincideDesc && !coincideDir) {
          return false;
        }
      }

      return true;
    });
  }

  colorEstado(estado: string): string {
    switch ((estado || '').toLowerCase()) {
      case 'resuelta': return 'success';
      case 'en proceso': return 'warning';
      case 'pendiente': return 'danger';
      default: return 'medium';
    }
  }

  colorPrioridad(prioridad: string): string {
    switch ((prioridad || '').toLowerCase()) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'medium';
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
