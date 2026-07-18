import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts: Observable<Toast[]> = this.toasts$.asObservable();
  private toastIdCounter = 0;

  private defaultDuration = 4000;
  private defaultDismissible = true;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number, dismissible?: boolean): void {
    const toast: Toast = {
      id: `toast-${this.toastIdCounter++}`,
      message,
      type,
      duration: duration ?? this.defaultDuration,
      dismissible: dismissible ?? this.defaultDismissible
    };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.remove(toast.id), toast.duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts$.next([]);
  }

  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration;
  }

  setDefaultDismissible(dismissible: boolean): void {
    this.defaultDismissible = dismissible;
  }
}
