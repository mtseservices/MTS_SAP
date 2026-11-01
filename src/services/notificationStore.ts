import { NotificationItem, NotificationType, NotificationSeverity } from '../types/erp';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    tenantId: 'tenant_albarka',
    title: 'Pending Purchase Order Approval Required',
    message: 'PO-2026-0041 (Engro Foods, PKR 3,457,400) is pending Executive Director sign-off.',
    type: 'APPROVAL',
    severity: 'HIGH',
    targetTab: 'approvals',
    read: false,
    timestamp: '2026-10-31T10:15:00Z'
  },
  {
    id: 'notif_2',
    tenantId: 'tenant_albarka',
    title: 'Low Stock Reorder Warning',
    message: 'Wheat Flour (50kg Bag) inventory stock is approaching reorder threshold level.',
    type: 'LOW_STOCK',
    severity: 'HIGH',
    targetTab: 'inventory',
    read: false,
    timestamp: '2026-10-31T09:30:00Z'
  },
  {
    id: 'notif_3',
    tenantId: 'tenant_albarka',
    title: 'Customer Receivable Payment Due',
    message: 'Invoice INV-2026-1092 (Metro Cash & Carry) has outstanding balance due of PKR 571,000.',
    type: 'PAYMENT_DUE',
    severity: 'MEDIUM',
    targetTab: 'sales',
    read: false,
    timestamp: '2026-10-30T14:20:00Z'
  },
  {
    id: 'notif_4',
    tenantId: 'tenant_solartech',
    title: 'Upcoming Subscription Installment Due',
    message: 'Quarterly subscription installment of PKR 300,000 is due on Nov 15, 2026.',
    type: 'PAYMENT_DUE',
    severity: 'MEDIUM',
    targetTab: 'masterSubscriptions',
    read: false,
    timestamp: '2026-10-29T11:00:00Z'
  }
];

class NotificationStoreManager {
  private notifications: NotificationItem[] = INITIAL_NOTIFICATIONS;
  private listeners: Array<(items: NotificationItem[]) => void> = [];

  public getNotifications(tenantId?: string): NotificationItem[] {
    if (!tenantId || tenantId === 'system_master') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.tenantId === tenantId || n.tenantId === 'system_master');
  }

  public getUnreadCount(tenantId?: string): number {
    return this.getNotifications(tenantId).filter(n => !n.read).length;
  }

  public subscribe(listener: (items: NotificationItem[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications);
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.listeners.forEach(fn => fn(this.notifications));
  }

  public markAllAsRead(tenantId?: string) {
    this.notifications = this.notifications.map(n => {
      if (!tenantId || n.tenantId === tenantId || tenantId === 'system_master') {
        return { ...n, read: true };
      }
      return n;
    });
    this.listeners.forEach(fn => fn(this.notifications));
  }

  public async addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>): Promise<NotificationItem> {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      timestamp: new Date().toISOString()
    };

    this.notifications = [newItem, ...this.notifications];
    this.listeners.forEach(fn => fn(this.notifications));

    try {
      const colPath = item.tenantId === 'system_master'
        ? collection(db, 'system', 'notifications', 'entries')
        : collection(db, 'tenants', item.tenantId, 'notifications');
      await addDoc(colPath, newItem);
    } catch (err) {
      console.warn('Firestore Notification write note:', err);
    }

    return newItem;
  }
}

export const notificationStore = new NotificationStoreManager();
