import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

export const StartupWelcome: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("lifeflow_welcome_shown");
    if (!hasShown) {
      setIsVisible(true);
      sessionStorage.setItem("lifeflow_welcome_shown", "true");

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);

      const handleKeyDown = () => setIsVisible(false);
      window.addEventListener("keydown", handleKeyDown, { once: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7F2] select-none cursor-pointer"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-accent/10 to-transparent blur-3xl pointer-events-none" />

          {/* Centered Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center z-10 px-6 max-w-sm"
          >
            {/* App Icon Mark */}
            <motion.div
              initial={{ scale: 0.8, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E2622A] to-[#C2410C] flex items-center justify-center shadow-lg shadow-accent/25 mb-5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>

            {/* Greeting */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-2xl font-bold font-sora text-[#1C1917] tracking-tight mb-1.5"
            >
              {isRTL ? "أهلاً بك مجدداً" : "Hello Again"}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-xs text-[#78716C] leading-relaxed mb-6"
            >
              {isRTL
                ? "مستعد ليوم منظم ومتوازن بكل هدوء وتركيز"
                : "Ready to design your day with clarity, balance, and focus"}
            </motion.p>

            {/* Windows 11 style subtle loading indicator line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 48, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeInOut" }}
              className="h-1 rounded-full bg-gradient-to-r from-accent-glow to-accent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
