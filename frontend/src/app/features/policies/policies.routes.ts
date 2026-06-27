import { Routes } from '@angular/router';

export const policiesRoutes: Routes = [
  {
    path: ':slug',
    loadComponent: () => import('./pages/policy.page').then((m) => m.PolicyPage),
  },
  {
    path: '',
    redirectTo: 'privacy',
    pathMatch: 'full',
  },
];
