import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'incidents-list',
    loadComponent: () => import('./pages/incidents-list/incidents-list.page').then(m => m.IncidentsListPage)
  },
  {
    path: 'listado',
    redirectTo: 'incidents-list',
    pathMatch: 'full'
  },
  {
    path: 'seguimiento',
    redirectTo: 'incidents-list',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'incident-detail/:id',
    loadComponent: () => import('./pages/incident-detail/incident-detail.page').then(m => m.IncidentDetailPage)
  },
  {
    path: 'detalle/:id',
    redirectTo: 'incident-detail/:id',
    pathMatch: 'full'
  },
  {
    path: 'incident-detail',
    loadComponent: () => import('./pages/incident-detail/incident-detail.page').then(m => m.IncidentDetailPage)
  }
];
