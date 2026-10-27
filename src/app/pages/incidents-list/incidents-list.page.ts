import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { IncidentService, Incident } from '../../services/incidents';
import { StorageService } from '../../services/storage';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  templateUrl: './incidents-list.page.html',
  styleUrls: ['./incidents-list.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, RouterModule]
})
export class IncidentsListPage implements OnInit {

  private incidentService = inject(IncidentService);
  private storageService = inject(StorageService);
  

  incidents: Incident[] = []
  seguimientosIds: string[] = [];
  currentPage = 1;
  pageSize = 5;
  hasMoreData = true;
  isLoadingError = false;

  async ngOnInit() {
    this.seguimientosIds = await this.storageService.seguimientoIds();
    this.HomePage();
  }

  HomePage() {
    this.currentPage = 1;
    this.hasMoreData = true;
    this.isLoadingError = false;

    this.incidentService.icidentsPage(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.incidents = data;
        if (data.length < this.pageSize) this.hasMoreData = false;
      },
      error: () => { this.isLoadingError = true; }
    });
  }

  cargarMasPaginas(event: InfiniteScrollCustomEvent) {
    if (!this.hasMoreData) {
      event.target.disabled = true;
      return;
    }

    this.currentPage++;
    this.incidentService.icidentsPage(this.currentPage, this.pageSize).subscribe({
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

  async toggleSeguimiento(id: string, event: Event) {
    event.stopPropagation();
    this.seguimientosIds = await this.storageService.toggleSeguimiento(id);
  }

  esSeguimiento(id: string): boolean {
    return this.seguimientosIds.includes(id);
  }

}
