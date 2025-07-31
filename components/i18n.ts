import { format as dateFormat } from "date-fns"
import { enUS, es } from "date-fns/locale"
import { useTranslation as _useTranslation } from "next-i18next"

// Maps supported language codes to their corresponding date-fns locale objects.
// Used by tDate to ensure date formatting respects the current language's locale.
const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es
}

/**
 * A wrapper around `next-i18next`'s `useTranslation` hook.
 *
 * Extends the default translation hook by adding `tDate`, a date formatting helper
 * that formats dates according to the active language's locale using date-fns.
 *
 * @returns The translation object from `next-i18next` plus `tDate` for localized date formatting.
 *
 * @example
 * const { t, tDate } = useTranslation("common");
 * console.log(t("welcome"));
 * console.log(tDate(new Date(), "PP")); // e.g., "Sep 1, 2025"
 */
export const useTranslation = (...args: Parameters<typeof _useTranslation>) => {
  const response = _useTranslation(...args)
  return {
    ...response,
    /**
     * Formats a date or date string according to the active language's locale.
     *
     * Only supports localized format tokens from date-fns.
     * See: https://date-fns.org/v2.0.0-alpha.25/docs/format
     *
     * @param date - ISO date string or Date object to format.
     * @param format - A localized date-fns format string (e.g., "PPpp").
     * @returns The localized, formatted date string.
     *
     * @example
     * tDate(new Date(), "PP"); // "Sep 1, 2025" in English, "1 sept 2025" in Spanish
     */
    tDate: (date: string | Date, format: string) => {
      date = typeof date === "string" ? new Date(date) : date
      return dateFormat(date, format, {
        locale: localeMap[response.i18n.language] ?? enUS
      })
    }
  }
}
