/**
 * Convenience wrapper around Sonner toast.
 *
 * Uses LifeFlow accent colours and consistent styling.
 */
import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string) =>
    sonnerToast.success(message, {
      style: { borderColor: "#22c55e30" },
    }),
  error: (message: string) =>
    sonnerToast.error(message, {
      style: { borderColor: "#ef444430" },
    }),
  warning: (message: string) =>
    sonnerToast.warning(message, {
      style: { borderColor: "#E99A4330" },
    }),
  info: (message: string) =>
    sonnerToast.info(message, {
      style: { borderColor: "#6366f130" },
    }),
};
