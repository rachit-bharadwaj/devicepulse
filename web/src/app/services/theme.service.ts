import { Injectable, signal } from '@angular/core';

export type AppTheme = 'modern' | 'xp';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<AppTheme>('modern');

  constructor() {
    this.loadInitialTheme();
  }

  private loadInitialTheme() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('app_theme') as AppTheme;
      if (saved === 'xp' || saved === 'modern') {
        this.currentTheme.set(saved);
      }
    }
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('app_theme', theme);
    }
  }

  toggleTheme() {
    const next = this.currentTheme() === 'modern' ? 'xp' : 'modern';
    this.setTheme(next);
  }
}
