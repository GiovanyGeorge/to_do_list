import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ar from "./ar.json";

const savedLang = localStorage.getItem("lifeflow_lang") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = (lang: "en" | "ar") => {
  i18n.changeLanguage(lang);
  localStorage.setItem("lifeflow_lang", lang);
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang);
};

// Initial setup of direction
const initialDir = savedLang === "ar" ? "rtl" : "ltr";
document.documentElement.setAttribute("dir", initialDir);
document.documentElement.setAttribute("lang", savedLang);

export default i18n;
