import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationSubject.asObservable();

  private nextId = 1;

  show(message: string, type: 'success' | 'danger') {
    const notification: Notification = {
      id: this.nextId++,
      message,
      type
    };

    this.notifications.push(notification);
    this.notificationSubject.next([...this.notifications]);

    // Auto-remove after 3s
    setTimeout(() => this.dismiss(notification.id), 3000);
  }

  dismiss(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationSubject.next([...this.notifications]);
  }

  clearAll() {
    this.notifications = [];
    this.notificationSubject.next([]);
  }
}
