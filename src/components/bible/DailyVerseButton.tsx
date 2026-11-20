import React from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { useBibleStore } from "@/store/useBibleStore";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";

export const DailyVerseButton: React.FC = () => {
  const { isPopoverOpen, togglePopover, isDailyVerseEnabled } = useBibleStore();
  const { enabled: motionEnabled } = useMotion();
  const { playSound } = useSoundManager();

  if (!isDailyVerseEnabled) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("navigation");
    togglePopover();
  };

  return (
    <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 select-none">
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={motionEnabled ? { scale: 1.08, y: -2 } : undefined}
        whileTap={motionEnabled ? { scale: 0.94 } : undefined}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-soft-card border focus:outline-none ${
          isPopoverOpen
            ? "bg-[#C2410C] text-[#FFFBEB] border-[#C2410C] shadow-terracotta-glow ring-2 ring-[#C2410C]/20"
            : "bg-white text-[#C2410C] border-[rgba(28,25,23,0.12)] hover:border-[#C2410C]/40 hover:shadow-card hover:bg-[#FAF7F2]"
        }`}
        title="Daily Bible Verse — آية اليوم"
        aria-label="Daily Bible Verse — آية اليوم"
        aria-expanded={isPopoverOpen}
      >
        <BookOpen className="w-5 h-5 stroke-[2.2]" />

        {/* Small subtle active dot indicator */}
        <span className="absolute -top-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-3 h-3 rounded-full bg-[#C2410C] border-2 border-white" />
      </motion.button>
    </div>
  );
};
