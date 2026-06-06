import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export interface Device {
  id?: number;
  name: string;
  ip_address: string;
  type: string;
  status: string;
  description?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/device';

  // State
  devices = signal<Device[]>([]);
  loading = signal(false);
  
  // Modal State
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedDeviceId = signal<number | null>(null);

  // Form Fields
  deviceName = signal('');
  deviceIp = signal('');
  deviceType = signal('Server');
  deviceStatus = signal('Online');
  deviceDesc = signal('');

  // Notifications
  toast = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  ngOnInit() {
    // Auth Guard check
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchDevices();
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  fetchDevices() {
    this.loading.set(true);
    this.http.get<any>(this.baseUrl).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.devices.set(res.devices || []);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Fetch Devices Error:', err);
        // Fallback: Mock devices for demo purposes
        this.showToast('Backend offline. Loading demo devices...', 'info');
        this.loadDemoDevices();
      }
    });
  }

  loadDemoDevices() {
    this.devices.set([
      { id: 1, name: 'Primary Firewall', ip_address: '192.168.1.1', type: 'Router', status: 'Online', description: 'Core router and firewall node.' },
      { id: 2, name: 'Main DB Server', ip_address: '192.168.1.10', type: 'Server', status: 'Online', description: 'Production database instances.' },
      { id: 3, name: 'Office AP-West', ip_address: '192.168.2.5', type: 'IoT Node', status: 'Warning', description: 'Access point with high user load.' },
      { id: 4, name: 'Backup Storage', ip_address: '10.0.0.12', type: 'Server', status: 'Offline', description: 'Weekly backup archive node.' }
    ]);
  }

  openAddModal() {
    this.modalMode.set('add');
    this.clearForm();
    this.showModal.set(true);
  }

  openEditModal(device: Device) {
    this.modalMode.set('edit');
    this.selectedDeviceId.set(device.id || null);
    this.deviceName.set(device.name);
    this.deviceIp.set(device.ip_address);
    this.deviceType.set(device.type);
    this.deviceStatus.set(device.status);
    this.deviceDesc.set(device.description || '');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.clearForm();
  }

  private clearForm() {
    this.selectedDeviceId.set(null);
    this.deviceName.set('');
    this.deviceIp.set('');
    this.deviceType.set('Server');
    this.deviceStatus.set('Online');
    this.deviceDesc.set('');
  }

  onSubmitDevice() {
    const payload: Device = {
      name: this.deviceName().trim(),
      ip_address: this.deviceIp().trim(),
      type: this.deviceType(),
      status: this.deviceStatus(),
      description: this.deviceDesc().trim()
    };

    if (!payload.name || !payload.ip_address) {
      this.showToast('Please fill out the device name and IP address', 'error');
      return;
    }

    this.loading.set(true);

    if (this.modalMode() === 'add') {
      this.http.post<any>(this.baseUrl, payload).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.showToast('Device added successfully!', 'success');
          this.closeModal();
          this.fetchDevices();
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Add Device Error:', err);
          
          // Fallback: Demo local add
          if (err.status === 0 || err.status === 404) {
            const current = this.devices();
            const newDevice = { ...payload, id: Date.now() };
            this.devices.set([...current, newDevice]);
            this.showToast('Demo: Device added locally', 'success');
            this.closeModal();
          } else {
            this.showToast(err.error?.detail || 'Failed to add device', 'error');
          }
        }
      });
    } else {
      const devId = this.selectedDeviceId();
      this.http.put<any>(`${this.baseUrl}/${devId}`, payload).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.showToast('Device updated successfully!', 'success');
          this.closeModal();
          this.fetchDevices();
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Update Device Error:', err);
          
          // Fallback: Demo local update
          if (err.status === 0 || err.status === 404) {
            const current = this.devices().map(d => d.id === devId ? { ...payload, id: devId! } : d);
            this.devices.set(current);
            this.showToast('Demo: Device updated locally', 'success');
            this.closeModal();
          } else {
            this.showToast(err.error?.detail || 'Failed to update device', 'error');
          }
        }
      });
    }
  }

  deleteDevice(id: number) {
    if (!confirm('Are you sure you want to remove this device?')) return;
    
    this.loading.set(true);
    this.http.delete<any>(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.loading.set(false);
        this.showToast('Device removed successfully!', 'success');
        this.fetchDevices();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Delete Device Error:', err);
        
        // Fallback: Demo local delete
        if (err.status === 0 || err.status === 404) {
          const current = this.devices().filter(d => d.id !== id);
          this.devices.set(current);
          this.showToast('Demo: Device removed locally', 'success');
        } else {
          this.showToast('Failed to remove device', 'error');
        }
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
