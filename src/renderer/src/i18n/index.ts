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
import setupFr from "../pages/Setup/__i18n__/fr";
import setupEn from "../pages/Setup/__i18n__/en";
import { GAMES } from "../games/registry";

const fr = {
  ...commonFr,
  ...sidebarFr,
  ...installFr,
  ...serversFr,
  ...settingsFr,
  ...setupFr,
  ...GAMES.reduce((acc, g) => ({ ...acc, ...g.i18n.fr }), {}),
};

const en = {
  ...commonEn,
  ...sidebarEn,
  ...installEn,
  ...serversEn,
  ...settingsEn,
  ...setupEn,
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

// Le main n'a pas i18n : on lui transmet la langue pour le menu de l'icône
// de la zone de notification.
const syncMainLanguage = (lng: string) =>
  window.api?.app
    ?.setLanguage(lng.startsWith("en") ? "en" : "fr")
    .catch(() => {});
syncMainLanguage(i18n.language ?? "fr");
i18n.on("languageChanged", syncMainLanguage);

export default i18n;
