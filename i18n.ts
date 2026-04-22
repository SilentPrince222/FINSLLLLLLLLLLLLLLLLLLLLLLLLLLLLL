import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
  // Bug 8.4: call notFound() for invalid locale instead of silently falling back
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
