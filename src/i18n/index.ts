import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ca from './locales/ca.json'
import mqOverrides from './locales/mq.json'

function deepMerge<T extends Record<string, unknown>>(
    base: T,
    overrides: Record<string, unknown>,
): T {
    const result = { ...base } as Record<string, unknown>

    for (const [key, value] of Object.entries(overrides)) {
        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            typeof result[key] === 'object' &&
            result[key] !== null &&
            !Array.isArray(result[key])
        ) {
            result[key] = deepMerge(
                result[key] as Record<string, unknown>,
                value as Record<string, unknown>,
            )
        } else {
            result[key] = value
        }
    }

    return result as T
}

const mq = deepMerge(es, mqOverrides)

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en,
            },
            es: {
                translation: es,
            },
            fr: {
                translation: fr,
            },
            ca: {
                translation: ca,
            },
            mq: {
                translation: mq,
            },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    })

export default i18n
