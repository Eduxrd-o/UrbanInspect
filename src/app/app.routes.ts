import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [publicGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'incidents-list',
    loadComponent: () => import('./pages/incidents-list/incidents-list.page').then(m => m.IncidentsListPage),
    canActivate: [authGuard]
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
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage),
    canActivate: [authGuard]
  },
  {
    path: 'incident-detail/:id',
    loadComponent: () => import('./pages/incident-detail/incident-detail.page').then(m => m.IncidentDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'detalle/:id',
    redirectTo: 'incident-detail/:id',
    pathMatch: 'full'
  },
  {
    path: 'incident-detail',
    loadComponent: () => import('./pages/incident-detail/incident-detail.page').then(m => m.IncidentDetailPage),
    canActivate: [authGuard]
  }
];
