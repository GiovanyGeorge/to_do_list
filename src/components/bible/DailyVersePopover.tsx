import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Copy, Check, Bookmark, X, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBibleStore } from "@/store/useBibleStore";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";

export const DailyVersePopover: React.FC = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const {
    dailyVerse,
    isDailyVerseFavorite,
    isPopoverOpen,
    closePopover,
    toggleDailyVerseFavorite,
    openFavoritesModal,
    fetchDailyVerse,
  } = useBibleStore();

  const { enabled: motionEnabled } = useMotion();
  const { playSound } = useSoundManager();
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch daily verse on open if not loaded
  useEffect(() => {
    if (isPopoverOpen && !dailyVerse) {
      fetchDailyVerse();
    }
  }, [isPopoverOpen, dailyVerse, fetchDailyVerse]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isPopoverOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        // Check if the click was on the floating button (which handles its own toggle)
        const target = e.target as HTMLElement;
        if (target.closest('button[aria-label="Daily Bible Verse — آية اليوم"]')) {
          return;
        }
        closePopover();
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPopoverOpen, closePopover]);

  const handleCopy = async () => {
    if (!dailyVerse) return;
    const bookName = isArabic ? dailyVerse.book_name_ar : dailyVerse.book_name_en;
    const refText = `${bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`;
    const fullText = `"${dailyVerse.text}" — ${refText} (ترجمة فان دايك)`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      playSound("navigation");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy verse:", err);
    }
  };

  const handleToggleFavorite = async () => {
    playSound("task_complete");
    await toggleDailyVerseFavorite();
  };

  const bookName = dailyVerse
    ? isArabic
      ? dailyVerse.book_name_ar
      : dailyVerse.book_name_en
    : "";

  return (
    <AnimatePresence>
      {isPopoverOpen && dailyVerse && (
        <motion.div
          ref={popoverRef}
          initial={motionEnabled ? { opacity: 0, scale: 0.92, y: 10 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={motionEnabled ? { opacity: 0, scale: 0.94, y: 8 } : undefined}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed bottom-20 right-6 rtl:right-auto rtl:left-6 z-50 w-84 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-card border border-[rgba(28,25,23,0.12)] p-4 text-[#1C1917] select-text overflow-hidden font-sans"
          role="dialog"
          aria-modal="false"
          aria-label="Today's Bible Verse"
        >
          {/* Header Row: Label, Reference, Actions */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,25,23,0.06)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#C2410C] border border-[#C2410C]/20 shrink-0">
                <Sparkles className="w-3 h-3 text-[#C2410C]" />
                <span>فان دايك</span>
              </span>

              <h3 className="text-sm font-bold truncate text-[#1C1917] tracking-tight">
                {bookName} {dailyVerse.chapter}:{dailyVerse.verse}
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[#78716C]">
              {/* Favorite Button */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDailyVerseFavorite
                    ? "text-[#B91C1C] bg-[#B91C1C]/10"
                    : "hover:text-[#B91C1C] hover:bg-[#FAF7F2]"
                }`}
                title={isDailyVerseFavorite ? "Remove from Favorites" : "Add to Favorites"}
                aria-label={isDailyVerseFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isDailyVerseFavorite ? "fill-[#B91C1C] scale-110" : ""
                  }`}
                />
              </button>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
                title="Copy verse"
                aria-label="Copy verse"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#15803D]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Saved Favorites List Link */}
              <button
                type="button"
                onClick={openFavoritesModal}
                className="p-1.5 rounded-lg hover:text-[#C2410C] hover:bg-[#FAF7F2] transition-colors"
                title="View Saved Favorites"
                aria-label="View Saved Favorites"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closePopover}
                className="p-1.5 rounded-lg hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Verse Text Body */}
          <div className="py-3.5 my-1 px-3 rounded-xl bg-[#FAF7F2] border border-[rgba(28,25,23,0.06)]">
            {dailyVerse.heading && (
              <div className="text-xs font-semibold text-[#78716C] mb-2 font-cairo pb-1.5 border-b border-[rgba(28,25,23,0.06)]">
                {dailyVerse.heading}
              </div>
            )}
            <p className="font-cairo text-[15px] sm:text-base leading-relaxed text-[#1C1917] font-medium text-justify rtl:text-right">
              {dailyVerse.text}
            </p>
          </div>

          {/* Footer: Date and Shortcut to Favorites */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#78716C]">
            <span className="font-medium">
              {isArabic ? "آية اليوم" : "Today's Verse"}
            </span>

            <button
              type="button"
              onClick={openFavoritesModal}
              className="text-[#C2410C] hover:underline font-medium flex items-center gap-1"
            >
              <span>{isArabic ? "الآيات المحفوظة" : "Saved Verses"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
