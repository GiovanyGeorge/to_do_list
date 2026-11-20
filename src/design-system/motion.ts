import type { Transition, Variants } from "motion/react";

/**
 * LifeFlow Motion & Timing Design System
 * 
 * Calm, premium desktop transitions that feel responsive and unobtrusive.
 */

// Timing Constants (in seconds)
export const MOTION_DURATIONS = {
  fast: 0.15,
  standard: 0.22,
  modal: 0.28,
  page: 0.32,
} as const;

// Easing curves
export const MOTION_EASINGS = {
  // Smooth cubic bezier ease-out for entrances
  easeOut: [0.16, 1, 0.3, 1] as const,
  // Standard ease-in-out for transitions
  easeInOut: [0.4, 0, 0.2, 1] as const,
  // Snappy ease-in for exits
  easeIn: [0.4, 0, 1, 1] as const,
};

// Reusable Transitions
export const transitions: Record<string, Transition> = {
  fast: {
    duration: MOTION_DURATIONS.fast,
    ease: MOTION_EASINGS.easeOut,
  },
  standard: {
    duration: MOTION_DURATIONS.standard,
    ease: MOTION_EASINGS.easeOut,
  },
  modal: {
    duration: MOTION_DURATIONS.modal,
    ease: MOTION_EASINGS.easeOut,
  },
  page: {
    duration: MOTION_DURATIONS.page,
    ease: MOTION_EASINGS.easeOut,
  },
};

// Page Transition Variants
// Enters from slightly below (opacity 0 -> 1, y 16 -> 0), exits smoothly (opacity 1 -> 0, y 0 -> -6)
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.page,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: MOTION_EASINGS.easeIn,
    },
  },
};

// Modal Variants (Fade + Subtle Scale)
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.16,
      ease: MOTION_EASINGS.easeIn,
    },
  },
};

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16 },
  },
};

// Dropdown / Popover Variants
export const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Staggered List Container Variants
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

// List Item Variants
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.12 },
  },
};

// Button Interaction Presets
export const buttonMotion = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.98 },
  transition: transitions.fast,
};

// Card Hover Preset
export const cardHoverMotion = {
  whileHover: { y: -2, transition: transitions.standard },
};

// Checkbox pop / bounce animation
export const checkboxPopVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.1 },
  },
};
