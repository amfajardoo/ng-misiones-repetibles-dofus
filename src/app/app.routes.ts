import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tracker/components/tracker/tracker').then((m) => m.Tracker),
  },
];
