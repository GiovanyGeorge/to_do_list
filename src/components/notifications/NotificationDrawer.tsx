import React from "react";
import { useTranslation } from "react-i18next";
import { X, Bell, CheckCircle } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

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
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-elevated transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification List / Empty State */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
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
        </div>
      </div>
    </div>
  );
};
