import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Boxes,
  CheckSquare,
  X,
  ExternalLink,
  Check
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { notificationStore } from '../../services/notificationStore';
import { NotificationItem, NotificationType } from '../../types/erp';
import { ActiveTab } from './Sidebar';

interface NotificationCenterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectTab }) => {
  const { isMasterPortal, currentCompany } = useAuthTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filterType, setFilterType] = useState<string>('ALL');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    notificationStore.subscribe((all) => {
      const activeTenant = isMasterPortal ? 'system_master' : currentCompany.tenantId;
      const filtered = notificationStore.getNotifications(activeTenant);
      setNotifications(filtered);
      setUnreadCount(notificationStore.getUnreadCount(activeTenant));
    });
  }, [isMasterPortal, currentCompany.tenantId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedList = filterType === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const handleNotificationClick = (n: NotificationItem) => {
    notificationStore.markAsRead(n.id);
    onSelectTab(n.targetTab as ActiveTab);
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    const activeTenant = isMasterPortal ? 'system_master' : currentCompany.tenantId;
    notificationStore.markAllAsRead(activeTenant);
  };

  const typeIcons: Record<NotificationType, React.ReactNode> = {
    APPROVAL: <CheckSquare className="w-4 h-4 text-amber-400" />,
    LOW_STOCK: <Boxes className="w-4 h-4 text-rose-400" />,
    PAYMENT_DUE: <DollarSign className="w-4 h-4 text-cyan-400" />,
    SYSTEM: <Bell className="w-4 h-4 text-purple-400" />
  };

  const typeLabels: Record<NotificationType, string> = {
    APPROVAL: 'Approval Pending',
    LOW_STOCK: 'Low Stock Warning',
    PAYMENT_DUE: 'Payment Due',
    SYSTEM: 'System Notice'
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
        title="Centralized Notification Center"
      >
        <Bell className="w-4 h-4 text-amber-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 max-h-[480px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                Notification Center
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark All Read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 pb-2 border-b border-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2 py-0.5 rounded transition-all ${filterType === 'ALL' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('APPROVAL')}
              className={`px-2 py-0.5 rounded transition-all ${filterType === 'APPROVAL' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Approvals
            </button>
            <button
              onClick={() => setFilterType('LOW_STOCK')}
              className={`px-2 py-0.5 rounded transition-all ${filterType === 'LOW_STOCK' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilterType('PAYMENT_DUE')}
              className={`px-2 py-0.5 rounded transition-all ${filterType === 'PAYMENT_DUE' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              Payments
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 py-2">
            {displayedList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 italic">
                No notifications found in this category.
              </div>
            ) : (
              displayedList.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                    !n.read
                      ? 'bg-slate-800/90 border-slate-700 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {typeIcons[n.type]}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse" />}
                        {n.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold">
                        {typeLabels[n.type]}
                      </span>
                      <span className="text-cyan-400 flex items-center gap-0.5 font-bold">
                        Open Module <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
