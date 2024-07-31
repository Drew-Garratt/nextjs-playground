import type { FC, PropsWithChildren } from "react";

export const AppTestProviders: FC<PropsWithChildren> = ({ children }) => {
  /** TODO: Add clientside mocking for internationalisation */
  return <>{children}</>;
};
