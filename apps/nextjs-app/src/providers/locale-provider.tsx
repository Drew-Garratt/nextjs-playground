import type { ReactNode } from "react";
import { availableLocaleCodes, defaultLocale } from "@/next.locales.mjs";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTimeZone,
  unstable_setRequestLocale,
} from "next-intl/server";

interface LocaleProviderProps {
  children: ReactNode;
  params?: { locale: string };
}

export function generateStaticParams() {
  return availableLocaleCodes.map((locale) => ({ locale }));
}

export async function LocaleProvider({
  children,
  params,
}: LocaleProviderProps) {
  let locale = defaultLocale.code;

  if (params) {
    locale = params.locale;
  }

  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const timezone = await getTimeZone();

  return (
    <NextIntlClientProvider messages={messages} timeZone={timezone}>
      {children}
    </NextIntlClientProvider>
  );
}
