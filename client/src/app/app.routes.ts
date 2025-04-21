import { Routes } from '@angular/router';

export const routes: Routes = [
  // Mặc định chuyển hướng đến trang chủ
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Module Public (lazy loaded)
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
  },
  
  // Module Admin (lazy loaded)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  
  // Module NotFound (lazy loaded)
  {
    path: '**',
    loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)
  }
];
