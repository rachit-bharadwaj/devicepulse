import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { UserService, UserDetail } from '../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  public readonly authService = inject(AuthService);
  public readonly themeService = inject(ThemeService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // State
  users = signal<UserDetail[]>([]);
  loading = signal(false);

  // Modal State
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedUserId = signal<number | null>(null);

  // Form Fields
  userName = signal('');
  userEmail = signal('');
  userPassword = signal('');
  userRole = signal('USER');
  userActive = signal(true);

  // Address Bar for retro look
  addressBarValue = '';

  // Notifications
  toast = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }
    this.addressBarValue = window.location.href;

    // Guard Check: Redirect if not authenticated or not an admin
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const current = this.authService.currentUser();
    if (!current || current.role !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    this.fetchUsers();
  }

  fetchUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res && res.users) {
          this.users.set(res.users);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Fetch Users Error:', err);
        this.showToast('Failed to fetch user accounts.', 'error');
      }
    });
  }

  openAddModal() {
    this.modalMode.set('add');
    this.selectedUserId.set(null);
    this.userName.set('');
    this.userEmail.set('');
    this.userPassword.set('');
    this.userRole.set('USER');
    this.userActive.set(true);
    this.showModal.set(true);
  }

  openEditModal(user: UserDetail) {
    this.modalMode.set('edit');
    this.selectedUserId.set(user.id || null);
    this.userName.set(user.username);
    this.userEmail.set(user.email);
    this.userPassword.set(''); // Clear password so it's only updated if typed
    this.userRole.set(user.role);
    this.userActive.set(user.is_active);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmitUser() {
    const payload: any = {
      username: this.userName().trim(),
      email: this.userEmail().trim(),
      role: this.userRole(),
      is_active: this.userActive()
    };

    if (this.modalMode() === 'add') {
      const pwd = this.userPassword().trim();
      if (!pwd) {
        this.showToast('Password is required for new users', 'error');
        return;
      }
      payload.password = pwd;

      this.userService.createUser(payload).subscribe({
        next: () => {
          this.showToast('User created successfully!', 'success');
          this.closeModal();
          this.fetchUsers();
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to create user account';
          this.showToast(msg, 'error');
        }
      });
    } else {
      const id = this.selectedUserId();
      if (!id) return;

      const pwd = this.userPassword().trim();
      if (pwd) {
        payload.password = pwd;
      }

      this.userService.updateUser(id, payload).subscribe({
        next: () => {
          this.showToast('User updated successfully!', 'success');
          this.closeModal();
          this.fetchUsers();
        },
        error: (err) => {
          const msg = err.error?.detail || 'Failed to update user account';
          this.showToast(msg, 'error');
        }
      });
    }
  }

  deleteUser(id: number) {
    const current = this.authService.currentUser();
    if (current && current.id === id) {
      this.showToast('You cannot delete your own account!', 'error');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.showToast('User deleted successfully!', 'success');
          this.fetchUsers();
        },
        error: (err) => {
          console.error('Delete User Error:', err);
          this.showToast('Failed to delete user.', 'error');
        }
      });
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  logout() {
    this.authService.logout();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  navigateAddress() {
    const val = this.addressBarValue.trim();
    if (!val) return;
    if (val.includes('login') || val.includes('register')) {
      this.router.navigate(['/login']);
    } else if (val.endsWith('/') || val.includes('localhost:3000') && !val.includes('user-management')) {
      this.router.navigate(['/']);
    }
  }
}
