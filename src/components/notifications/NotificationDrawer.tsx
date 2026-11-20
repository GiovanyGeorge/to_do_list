import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Bell, CheckCircle, Trash2, Clock } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { notifications, fetchNotifications, clearAll, addNotification } =
    useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (window.electronAPI?.onNotificationReceived) {
      const unsubscribe = window.electronAPI.onNotificationReceived((notif) => {
        addNotification(notif);
      });
      return unsubscribe;
    }
  }, [addNotification]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-sm bg-background-sidebar border-l rtl:border-l-0 rtl:border-r border-border-subtle shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">
                {t("header.notifications")}
              </h2>
              {notifications.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-bold">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear All"
                  className="p-1 rounded-lg text-text-muted hover:text-red-400 hover:bg-background-elevated transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List / Empty State */}
          <div className="flex-1 overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-medium text-text-primary mb-1">
                  All caught up!
                </h3>
                <p className="text-xs text-text-secondary max-w-xs">
                  You have no pending reminders or notifications at this moment.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-background-card border border-border-subtle space-y-1 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-text-primary leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Intl.DateTimeFormat(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(item.delivered_at))}
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {item.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
