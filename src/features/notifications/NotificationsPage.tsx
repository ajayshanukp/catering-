import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { NotificationItem } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell, CheckCheck, Briefcase, DollarSign, UserCheck, Info } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (profile) {
      setNotifications(workforceService.getNotifications(profile.uid));
    }
  }, [profile]);

  if (!profile) return null;

  const filteredNotifs = notifications.filter(n => filter === 'all' || !n.isRead);
  const unreadItems = notifications.filter(n => !n.isRead);

  const handleMarkAllRead = () => {
    workforceService.markAllNotificationsAsRead(profile.uid);
    setNotifications(workforceService.getNotifications(profile.uid));
    refreshProfile();
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      workforceService.markNotificationAsRead(profile.uid, item.id);
      setNotifications(workforceService.getNotifications(profile.uid));
      refreshProfile();
    }
    if (item.targetUrl) {
      navigate(item.targetUrl);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'work': return <Briefcase className="w-4 h-4 text-teal-600" />;
      case 'wage': return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'application': return <UserCheck className="w-4 h-4 text-amber-600" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Notifications</h2>
          <p className="text-xs text-text-muted mt-0.5">Alerts, assignments, wage publishing, and status changes</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-control text-xs font-semibold transition-all ${
                filter === 'all' ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-control text-xs font-semibold transition-all ${
                filter === 'unread' ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
              }`}
            >
              Unread ({unreadItems.length})
            </button>
          </div>

          {unreadItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              icon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-12 h-12 text-slate-300" />}
          title="You have no notifications yet"
          description={filter === 'unread' ? 'You have read all notifications.' : 'When event updates or wage changes occur, they will appear here.'}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredNotifs.map((item) => (
            <Card
              key={item.id}
              variant="interactive"
              padding="sm"
              onClick={() => handleNotificationClick(item)}
              className={`transition-all ${!item.isRead ? 'border-l-4 border-l-primary bg-teal-50/20' : 'bg-surface'}`}
            >
              <div className="flex items-start gap-3 p-2">
                <div className="p-2 rounded-full bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className={`text-xs ${!item.isRead ? 'font-bold text-text-strong' : 'font-semibold text-slate-700'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
