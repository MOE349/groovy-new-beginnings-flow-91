import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { LOCALE_CONFIG } from '@/config/api';

i18n
  // Load translation using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: LOCALE_CONFIG.DEFAULT_LOCALE,
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    ns: ['common', 'navigation', 'assets', 'workorders', 'billing', 'auth', 'errors'],
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false, // We'll handle loading states ourselves
    },
  });

export default i18n;