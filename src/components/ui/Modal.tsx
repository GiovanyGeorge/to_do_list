import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import { X } from "lucide-react";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { modal, backdrop } = useMotion();
  const { playSound } = useSoundManager();
  const prevOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      playSound("modal_open");
    }
    prevOpen.current = isOpen;
  }, [isOpen, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdrop}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            variants={modal}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              "relative w-full rounded-2xl bg-background-card border border-border-subtle shadow-2xl p-6 overflow-hidden z-10",
              maxWidthStyles[maxWidth]
            )}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs text-text-secondary mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
