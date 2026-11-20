import React from "react";
import { motion } from "motion/react";
import { useMotion } from "@/hooks/useMotion";

/**
 * Wraps a page component with entrance/exit animation.
 * Place inside each <Route element={...} /> to get smooth page transitions
 * with AnimatePresence in the Shell.
 */
export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { page } = useMotion();

  return (
    <motion.div
      variants={page}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
};
