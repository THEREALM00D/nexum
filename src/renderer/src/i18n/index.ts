import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonFr from "./__i18n__/fr";
import commonEn from "./__i18n__/en";
import sidebarFr from "../components/Sidebar/__i18n__/fr";
import sidebarEn from "../components/Sidebar/__i18n__/en";
import installFr from "../pages/Install/__i18n__/fr";
import installEn from "../pages/Install/__i18n__/en";
import serversFr from "../pages/Servers/__i18n__/fr";
import serversEn from "../pages/Servers/__i18n__/en";
import settingsFr from "../pages/Settings/__i18n__/fr";
import settingsEn from "../pages/Settings/__i18n__/en";
import { GAMES } from "../games/registry";

const fr = {
  ...commonFr,
  ...sidebarFr,
  ...installFr,
  ...serversFr,
  ...settingsFr,
  ...GAMES.reduce((acc, g) => ({ ...acc, ...g.i18n.fr }), {}),
};

const en = {
  ...commonEn,
  ...sidebarEn,
  ...installEn,
  ...serversEn,
  ...settingsEn,
  ...GAMES.reduce((acc, g) => ({ ...acc, ...g.i18n.en }), {}),
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "locale",
      caches: ["localStorage"],
    },
  });

export default i18n;
