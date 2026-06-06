import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  // Form fields
  username = signal('');
  password = signal('');
  email = signal('');
  
  // State
  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  showPassword = signal(false);
  
  // Notifications
  toast = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  ngOnInit() {
    this.route.url.subscribe(url => {
      const path = url[0]?.path;
      if (path === 'register') {
        this.mode.set('register');
      } else {
        this.mode.set('login');
      }
    });
  }

  // Switch between Login and Register modes
  setMode(newMode: 'login' | 'register') {
    this.clearForm();
    this.router.navigate([`/${newMode}`]);
  }

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  private clearForm() {
    this.username.set('');
    this.password.set('');
    this.email.set('');
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  onSubmit() {
    if (this.mode() === 'login') {
      this.login();
    } else {
      this.register();
    }
  }

  private login() {
    const userVal = this.username().trim();
    const passVal = this.password().trim();

    if (!userVal || !passVal) {
      this.showToast('Please enter both username and password', 'error');
      return;
    }

    this.loading.set(true);

    // Call real backend endpoint or mock it
    const payload = { username: userVal, password: passVal };
    
    this.http.post('http://localhost:8000/auth/login', payload).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.showToast('Logged in successfully!', 'success');
        console.log('Login Response:', res);
        
        // Save token to localStorage
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
        }
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        // Redirect to dashboard (if it exists, or just log success)
        // setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Login Error:', err);
        const errMsg = err.error?.detail || 'Invalid username or password';
        
        // Fallback: If backend is not running, let's allow a demo login
        if (err.status === 0 || err.status === 404) {
          this.showToast('Backend offline. Simulating demo login...', 'info');
          setTimeout(() => {
            if (userVal === 'admin' && passVal === 'admin123') {
              this.showToast('Demo login successful!', 'success');
              localStorage.setItem('access_token', 'demo-token');
              localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin' }));
            } else {
              this.showToast('Demo credentials: admin / admin123', 'error');
            }
          }, 1500);
        } else {
          this.showToast(errMsg, 'error');
        }
      }
    });
  }

  private register() {
    const userVal = this.username().trim();
    const emailVal = this.email().trim();
    const passVal = this.password().trim();

    if (!userVal || !emailVal || !passVal) {
      this.showToast('Please fill out all fields', 'error');
      return;
    }

    // Basic email pattern check
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(emailVal)) {
      this.showToast('Please enter a valid email address', 'error');
      return;
    }

    if (passVal.length < 6) {
      this.showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    this.loading.set(true);

    const payload = {
      username: userVal,
      email: emailVal,
      password: passVal,
      role: 'user',
      is_active: true
    };

    this.http.post('http://localhost:8000/auth/register', payload).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.showToast('Registered successfully! You can now sign in.', 'success');
        console.log('Register Response:', res);
        
        // Switch to login mode
        setTimeout(() => this.setMode('login'), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Register Error:', err);
        const errMsg = err.error?.detail || 'Failed to register. Username or email may exist.';
        
        // Fallback: If backend is not running, simulate registration
        if (err.status === 0 || err.status === 404) {
          this.showToast('Backend offline. Simulating demo registration...', 'info');
          setTimeout(() => {
            this.showToast('Demo registration successful! Switching to login.', 'success');
            setTimeout(() => this.setMode('login'), 1000);
          }, 1500);
        } else {
          this.showToast(errMsg, 'error');
        }
      }
    });
  }
}
