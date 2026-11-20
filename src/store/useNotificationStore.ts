import { create } from "zustand";
import type { NotificationLogRecord } from "@shared/types/database";

interface NotificationStoreState {
  notifications: NotificationLogRecord[];
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notif: NotificationLogRecord) => void;
}

let fallbackNotifications: NotificationLogRecord[] = [];

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      if (window.electronAPI?.listNotifications) {
        const list = await window.electronAPI.listNotifications(50);
        set({ notifications: list, isLoading: false });
      } else {
        set({ notifications: [...fallbackNotifications], isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearAll: async () => {
    try {
      if (window.electronAPI?.clearNotifications) {
        await window.electronAPI.clearNotifications();
      }
      fallbackNotifications = [];
      set({ notifications: [] });
    } catch {
      // error handling
    }
  },

  addNotification: (notif: NotificationLogRecord) => {
    fallbackNotifications.unshift(notif);
    set((state) => ({ notifications: [notif, ...state.notifications] }));
  },
}));
