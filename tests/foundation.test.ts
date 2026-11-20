import { describe, it, expect } from "vitest";
import { COLOR_TOKENS } from "@shared/constants/tokens";
import enTranslations from "@/locales/en.json";
import arTranslations from "@/locales/ar.json";
import { useAppStore } from "@/store/useAppStore";

describe("Foundation & Design Tokens", () => {
  it("has approved color tokens matching the project plan specification", () => {
    expect(COLOR_TOKENS.background.main).toBe("#111318");
    expect(COLOR_TOKENS.background.sidebar).toBe("#151920");
    expect(COLOR_TOKENS.background.card).toBe("#191D24");
    expect(COLOR_TOKENS.background.elevated).toBe("#252B35");
    expect(COLOR_TOKENS.accent.primary).toBe("#E99A43");
    expect(COLOR_TOKENS.text.primary).toBe("#F3F4F6");
    expect(COLOR_TOKENS.text.secondary).toBe("#9299A5");
  });

  it("ensures Arabic and English locale files have parity across top-level keys", () => {
    const enKeys = Object.keys(enTranslations);
    const arKeys = Object.keys(arTranslations);

    expect(arKeys.sort()).toEqual(enKeys.sort());

    for (const key of enKeys) {
      const enSubkeys = Object.keys((enTranslations as Record<string, unknown>)[key] as object);
      const arSubkeys = Object.keys((arTranslations as Record<string, unknown>)[key] as object);
      expect(arSubkeys.sort()).toEqual(enSubkeys.sort());
    }
  });

  it("manages app store state correctly for language and sidebar collapse", () => {
    const { getState } = useAppStore;
    expect(getState().sidebarCollapsed).toBe(false);

    getState().toggleSidebar();
    expect(getState().sidebarCollapsed).toBe(true);

    getState().toggleSidebar();
    expect(getState().sidebarCollapsed).toBe(false);

    getState().setLanguage("ar");
    expect(getState().language).toBe("ar");
  });
});
