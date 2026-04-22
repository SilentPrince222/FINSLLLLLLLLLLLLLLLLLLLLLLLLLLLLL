import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && routing.locales.includes(locale as typeof routing.locales[number])
    ? locale
    : routing.defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});
