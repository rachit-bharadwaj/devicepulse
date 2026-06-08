import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { UserManagementComponent } from './user-management/user-management';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: LoginComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'login' }
];
