import { NotificationItem, NotificationType, NotificationSeverity } from '../types/erp';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';
import { whatsappService } from './whatsappService';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    tenantId: 'tenant_crest',
    title: 'Pending Cotton Purchase Order Approval',
    message: 'PO-2026-0041 (Indus Ginning Mills, PKR 2,879,200) is pending Executive Director sign-off.',
    type: 'APPROVAL',
    severity: 'HIGH',
    targetTab: 'approvals',
    read: false,
    timestamp: '2026-10-31T10:15:00Z'
  },
  {
    id: 'notif_2',
    tenantId: 'tenant_crest',
    title: 'Low Stock Reorder Warning - Cotton Bales',
    message: 'Raw Cotton Bales inventory in Faisalabad Store is approaching reorder threshold level.',
    type: 'LOW_STOCK',
    severity: 'HIGH',
    targetTab: 'inventory',
    read: false,
    timestamp: '2026-10-31T09:30:00Z'
  },
  {
    id: 'notif_3',
    tenantId: 'tenant_crest',
    title: 'Customer Export Receivable Payment Due',
    message: 'Invoice INV-2026-1092 (Global Apparel Sourcing Europe) balance of PKR 1,279,000 is due.',
    type: 'PAYMENT_DUE',
    severity: 'MEDIUM',
    targetTab: 'sales',
    read: false,
    timestamp: '2026-10-30T14:20:00Z'
  },
  {
    id: 'notif_4',
    tenantId: 'tenant_crest',
    title: 'Enterprise ERP License Active',
    message: 'Crest Textile Mills Ltd enterprise tenant license is active with full FBR STRN 18% compliance.',
    type: 'PAYMENT_DUE',
    severity: 'INFO',
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

    // Handle Firestore Persistence
    try {
      const colPath = item.tenantId === 'system_master'
        ? collection(db, 'system', 'notifications', 'entries')
        : collection(db, 'tenants', item.tenantId, 'notifications');
      await addDoc(colPath, newItem);
    } catch (err) {
      console.warn('Firestore Notification write note:', err);
    }

    // Trigger WhatsApp Transactional Alerts if enabled for the tenant
    if (item.tenantId !== 'system_master') {
      this.triggerWhatsAppAlert(item, newItem.message);
    }

    return newItem;
  }

  private async triggerWhatsAppAlert(item: any, message: string) {
    try {
      // 1. Fetch company communication settings (In real world, this would be cached)
      const q = query(collection(db, 'tenants'), where('tenantId', '==', item.tenantId), limit(1));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const company = snap.docs[0].data();
        const gateway = company.communicationGateways;

        if (gateway?.whatsappAlertsEnabled && gateway?.whatsappPhone) {
          const phone = gateway.whatsappPhone;

          if (item.type === 'LOW_STOCK') {
            // Simplified parsing for mock - in reality we'd pass structured data to addNotification
            await whatsappService.sendInventoryAlert(phone, 'Enterprise Item', 0, 0);
          } else if (item.type === 'APPROVAL') {
            await whatsappService.sendInvoiceApprovalAlert(phone, 'REQ-001', 'PKR 1M+', 'MTS Vendor');
          }
        }
      }
    } catch (err) {
      console.error('WhatsApp trigger failed:', err);
    }
  }
}

export const notificationStore = new NotificationStoreManager();
