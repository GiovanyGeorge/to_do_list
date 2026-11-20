import { usePreferencesStore } from "@/store/usePreferencesStore";
import {
  pageVariants,
  modalVariants,
  backdropVariants,
  dropdownVariants,
  listContainerVariants,
  listItemVariants,
  buttonMotion,
  cardHoverMotion,
  checkboxPopVariants,
  transitions,
} from "@/design-system/motion";
import type { Variants } from "motion/react";

/**
 * Central hook that returns motion presets gated by user preferences.
 *
 * When animations are disabled or reduced-motion is on, every variant
 * collapses to a static identity transform so components render instantly
 * without any layout shift.
 */

const STATIC_VARIANT: Variants = {
  initial: {},
  animate: {},
  exit: {},
};

const STATIC_INTERACTION = {
  whileHover: {},
  whileTap: {},
  transition: { duration: 0 },
};

export function useMotion() {
  const { animationsEnabled, reducedMotion } = usePreferencesStore();
  const enabled = animationsEnabled && !reducedMotion;

  return {
    enabled,
    page: enabled ? pageVariants : STATIC_VARIANT,
    modal: enabled ? modalVariants : STATIC_VARIANT,
    backdrop: enabled ? backdropVariants : STATIC_VARIANT,
    dropdown: enabled ? dropdownVariants : STATIC_VARIANT,
    listContainer: enabled ? listContainerVariants : STATIC_VARIANT,
    listItem: enabled ? listItemVariants : STATIC_VARIANT,
    button: enabled ? buttonMotion : STATIC_INTERACTION,
    cardHover: enabled ? cardHoverMotion : STATIC_INTERACTION,
    checkboxPop: enabled ? checkboxPopVariants : STATIC_VARIANT,
    transitions: enabled ? transitions : { fast: { duration: 0 }, standard: { duration: 0 }, modal: { duration: 0 }, page: { duration: 0 } },
  };
}
