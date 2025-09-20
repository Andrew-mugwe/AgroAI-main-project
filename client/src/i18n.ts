import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Platform } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import { missingKeyHandler } from './utils/missingTranslationsLogger';

// Import base translations
import enCommon from './locales/en/common.json';
import enFarmer from './locales/en/farmer.json';
import enNGO from './locales/en/ngo.json';
import enTrader from './locales/en/trader.json';

const FALLBACK_LANGUAGE = 'en';
const AVAILABLE_LANGUAGES = ['en', 'sw', 'fr'];

// Get device language for React Native
const getDeviceLanguage = () => {
  if (Platform.OS === 'web') return undefined;
  
  const locales = RNLocalize.getLocales();
  if (!locales.length) return FALLBACK_LANGUAGE;
  
  const deviceLanguage = locales[0].languageCode;
  return AVAILABLE_LANGUAGES.includes(deviceLanguage) ? deviceLanguage : FALLBACK_LANGUAGE;
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .use(Platform.OS === 'web' ? LanguageDetector : undefined)
  .init({
    resources: {
      en: {
        common: enCommon,
        farmer: enFarmer,
        ngo: enNGO,
        trader: enTrader,
      },
    },
    lng: getDeviceLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: AVAILABLE_LANGUAGES,
    
    ns: ['common'],
    defaultNS: 'common',
    fallbackNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: true,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
    },
    
    saveMissing: true,
    missingKeyHandler: missingKeyHandler,
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

// Dynamic role namespace loading
export const loadRoleNamespace = async (role: string, lang: string) => {
  try {
    const translations = await import(`./locales/${lang}/${role}.json`);
    i18n.addResourceBundle(lang, role, translations, true, true);
    await i18n.loadNamespaces([role]);
  } catch (error) {
    console.warn(`Missing translations for ${lang}/${role}.json`);
    
    // Try loading English fallback if different language
    if (lang !== FALLBACK_LANGUAGE) {
      try {
        const fallbackTranslations = await import(`./locales/${FALLBACK_LANGUAGE}/${role}.json`);
        i18n.addResourceBundle(lang, role, fallbackTranslations, true, true);
        await i18n.loadNamespaces([role]);
      } catch {
        console.error(`Missing fallback translations for ${FALLBACK_LANGUAGE}/${role}.json`);
      }
    }
  }
};

export default i18n;
