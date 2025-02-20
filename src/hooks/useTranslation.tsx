import en from "../locales/en/common.json"
import es from "../locales/es/common.json"
import it from "../locales/it/common.json"
import dk from "../locales/dk/common.json"
import nl from "../locales/nl/common.json"

const translations: Record<string, Record<string, string>> = {
  en,
  es,
  it,
  dk,
  nl
}

const replacePlaceholders = (
  text: string,
  values?: Record<string, any>
): string => {
  if (!values) return text
  return text.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => values[key.trim()] ?? `{{${key}}}`
  )
}

export function useTranslation() {
  const isClient = typeof window !== "undefined"
  const locale = isClient ? localStorage.getItem("locale") : null
  const currentLocale = locale && translations[locale] ? locale : "en"

  const t = (key: string, values?: Record<string, any>): string => {
    const translation = translations[currentLocale][key] || key
    return replacePlaceholders(translation, values)
  }

  const tLocale = (
    key: string,
    locale: string,
    values?: Record<string, any>
  ): string => {
    const translation = translations[locale]?.[key] || key
    return replacePlaceholders(translation, values)
  }

  const setLocale = (locale: string) => {
    localStorage.setItem("locale", locale)
  }

  return { t, tLocale, setLocale, locale: currentLocale }
}

export class TranslationBackend {
  private locale: string

  constructor(locale: string = "en") {
    this.locale = locale
  }

  t(key: string, values?: Record<string, any>): string {
    const translation = translations[this.locale]?.[key] || key
    return replacePlaceholders(translation, values)
  }

  tLocale(key: string, locale: string, values?: Record<string, any>): string {
    const translation = translations[locale]?.[key] || key
    return replacePlaceholders(translation, values)
  }
}

/*



Function to detect if have a translation or not




export function useTranslation() {
  const isClient = typeof window !== "undefined"

  const locale = isClient ? localStorage.getItem("locale") : null

  const currentLocale =
    locale && Object.keys(translations).includes(locale) ? locale : "en"

  const t = (key: string): JSX.Element => {
    const translation = translations[currentLocale][key]
    if (translation) {
      return <span data-cy='translated'>{translation}</span>
    }
    return <span data-cy='not-translated'>{key}</span>
  }

  const tLocale = (key: string, locale: string) => {
    const translation = translations[locale][key]
    if (translation) {
      return <span data-cy='translated'>{translation}</span>
    }
    return <span data-cy='not-translated'>{key}</span>
  }

  const setLocale = (locale: string) => {
    localStorage.setItem("locale", locale)
  }

  return { t, tLocale, setLocale, locale: currentLocale }
}

export class TranslationBackend {
  private locale: string

  constructor(locale: string = "en") {
    this.locale = locale
  }

  t(key: string): JSX.Element {
    const translation = translations[this.locale][key]
    if (translation) {
      return <span data-cy='translated'>{translation}</span>
    }
    return <span data-cy='not-translated'>{key}</span>
  }

  tLocale(key: string, locale: string): JSX.Element {
    const translation = translations[locale][key]
    if (translation) {
      return <span data-cy='translated'>{translation}</span>
    }
    return <span data-cy='not-translated'>{key}</span>
  }
}

*/
