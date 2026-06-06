import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: LoginComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'login' }
];
