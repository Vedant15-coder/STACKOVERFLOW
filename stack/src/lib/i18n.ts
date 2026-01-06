import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translations inline to avoid TypeScript import issues
const resources = {
    en: {
        translation: require('../../public/locales/en/common.json'),
    },
    hi: {
        translation: require('../../public/locales/hi/common.json'),
    },
    es: {
        translation: require('../../public/locales/es/common.json'),
    },
    pt: {
        translation: require('../../public/locales/pt/common.json'),
    },
    fr: {
        translation: require('../../public/locales/fr/common.json'),
    },
    zh: {
        translation: require('../../public/locales/zh/common.json'),
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
