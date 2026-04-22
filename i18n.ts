import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl v4: requestLocale is a Promise. Resolve, then validate.
  const requested = await requestLocale;
  const locale = requested && routing.locales.includes(requested as typeof routing.locales[number])
    ? requested
    : routing.defaultLocale;

  if (!locale) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
