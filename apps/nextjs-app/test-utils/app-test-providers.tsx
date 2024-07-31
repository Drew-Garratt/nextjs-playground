import type { FC, PropsWithChildren } from "react";
import { NextIntlClientProvider } from "next-intl";

import englishLocale from "@/i18n/locales/en.json";

export const AppTestProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NextIntlClientProvider
      locale="en"
      timeZone="Etc/UTC"
      messages={englishLocale}
    >
      {children}
    </NextIntlClientProvider>
  );
};
