import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<ToastMessage[]>([]);
  public toasts = this.toastsSignal.asReadonly();

  show(message: string, title = 'Notification', type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 5000): void {
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

  success(message: string, title = 'Success'): void {
    this.show(message, title, 'success');
  }

  error(message: string, title = 'Error'): void {
    this.show(message, title, 'error', 7000);
  }

  info(message: string, title = 'Information'): void {
    this.show(message, title, 'info');
  }

  warning(message: string, title = 'Notice'): void {
    this.show(message, title, 'warning');
  }

  remove(id: string): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}
