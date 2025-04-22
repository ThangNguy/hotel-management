import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect to home page
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Public Module (lazy loaded)
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
  },
  
  // Admin Module (lazy loaded)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  
  // NotFound Module (lazy loaded)
  {
    path: '**',
    loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)
  }
];
