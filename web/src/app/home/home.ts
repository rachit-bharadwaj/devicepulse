import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { environment } from '../../environments/environment';

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
export class HomeComponent implements OnInit, OnDestroy {
  public readonly authService = inject(AuthService);
  public readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/device`;

  // State
  devices = signal<Device[]>([]);
  onlineDevicesCount = computed(() => {
    return this.devices().filter(d => d.status === 'UP' || d.status === 'Online').length;
  });
  loading = signal(false);
  
  // Modal State
  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedDeviceId = signal<number | null>(null);

  // Form Fields
  deviceName = signal('');
  deviceIp = signal('');
  deviceType = signal('Server');
  deviceStatus = signal('UP');
  deviceDesc = signal('');

  // Address Bar
  addressBarValue = '';

  // Notifications
  toast = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }
    this.addressBarValue = window.location.href;
    
    // Dynamically update address bar when local navigation occurs
    this.router.events.subscribe(() => {
      if (typeof window !== 'undefined') {
        this.addressBarValue = window.location.href;
      }
    });

    // Auth Guard check
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchDevices();
    this.connectWebSocket();
  }

  navigateAddress() {
    let target = this.addressBarValue.trim();
    if (!target) return;

    // Normalize path separators
    const normalized = target.replace(/\//g, '\\');

    // 1. If logon / login / register
    if (
      normalized.toLowerCase().includes('devicepulse\\login') || 
      normalized.toLowerCase().includes('devicepulse\\logon') ||
      normalized.toLowerCase().endsWith('\\login') ||
      normalized.toLowerCase().endsWith('\\logon') ||
      normalized.toLowerCase().endsWith('\\register')
    ) {
      const path = normalized.toLowerCase().includes('register') ? '/register' : '/login';
      this.router.navigate([path]);
      return;
    }

    // 2. If local grid / root
    if (
      normalized.toLowerCase().includes('devicepulse\\localgrid') ||
      normalized.toLowerCase().endsWith('\\localgrid') ||
      normalized.toLowerCase() === 'c:\\devicepulse' ||
      normalized === '\\' ||
      normalized === ''
    ) {
      this.router.navigate(['/']);
      this.addressBarValue = 'C:\\DevicePulse\\LocalGrid';
      return;
    }

    // 3. Absolute URL
    if (target.startsWith('http://') || target.startsWith('https://')) {
      try {
        const urlObj = new URL(target);
        if (urlObj.origin === window.location.origin) {
          this.router.navigate([urlObj.pathname]);
        } else {
          window.location.href = target;
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    // 4. Relative paths / fallback
    let relative = target.replace(/\\/g, '/');
    if (!relative.startsWith('/')) {
      relative = '/' + relative;
    }
    this.router.navigate([relative]);
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
        const sorted = (res.devices || []).sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
        this.devices.set(sorted);
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
    this.deviceStatus.set('UP');
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

  goToUserManagement() {
    this.router.navigate(['/user-management']);
  }

  logout() {
    this.authService.logout();
  }

  private ws: WebSocket | null = null;

  connectWebSocket() {
    const wsUrl = `${environment.wsUrl}/ws`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.event;
        const device = data.device;
        const id = data.id;

        if (eventType === 'device_created') {
          const current = this.devices();
          if (!current.some(d => d.id === device.id)) {
            const updated = [...current, device].sort((a, b) => (a.id || 0) - (b.id || 0));
            this.devices.set(updated);
          }
        } else if (eventType === 'device_updated') {
          const current = this.devices();
          const existing = current.find(d => d.id === device.id);
          if (existing && existing.status !== device.status) {
            this.showToast(`Device "${device.name}" is now ${device.status}`, device.status === 'UP' ? 'success' : 'error');
          }
          const updated = current.map(d => d.id === device.id ? device : d);
          this.devices.set(updated);
        } else if (eventType === 'device_deleted') {
          const current = this.devices();
          this.devices.set(current.filter(d => d.id !== id));
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed. Reconnecting in 3 seconds...');
      setTimeout(() => this.connectWebSocket(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      this.ws?.close();
    };
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }
}
