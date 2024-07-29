import type { ReactNode } from "react";

import { LocaleProvider } from "~/providers/locale-provider";
import { MockLoader } from "~/providers/mock-loader";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <MockLoader>
      <LocaleProvider>{children}</LocaleProvider>
    </MockLoader>
  );
};

export { AppProviders };
