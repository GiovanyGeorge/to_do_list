import React from "react";
import { motion } from "motion/react";
import { useMotion } from "@/hooks/useMotion";

/**
 * Wraps a page component with a snappy, single-phase entrance transition.
 * Prevents double-animation and lag during navigation.
 */
export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { enabled } = useMotion();

  if (!enabled) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
