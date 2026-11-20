import { Injectable, inject, signal } from '@angular/core';
import { ToastMessage } from '../models/models';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private translation = inject(TranslationService);
  private toastsSignal = signal<ToastMessage[]>([]);
  public toasts = this.toastsSignal.asReadonly();

  show(message: string, title: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 5000): void {
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date()
    };

    this.toastsSignal.update(list => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  success(message: string, title?: string): void {
    this.show(message, title ?? this.translation.translate('toast.titleSuccess'), 'success');
  }

  error(message: string, title?: string): void {
    this.show(message, title ?? this.translation.translate('toast.titleError'), 'error', 7000);
  }

  info(message: string, title?: string): void {
    this.show(message, title ?? this.translation.translate('toast.titleInfo'), 'info');
  }

  warning(message: string, title?: string): void {
    this.show(message, title ?? this.translation.translate('toast.titleNotice'), 'warning');
  }

  remove(id: string): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}
