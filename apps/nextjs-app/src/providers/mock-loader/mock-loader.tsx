import dynamic from "next/dynamic";

import { env } from "~/env.mjs";

const MockProvider = dynamic(() =>
  import("./mock-provider").then((mod) => mod.MockProvider),
);

const MockLoader = ({ children }: { children: React.ReactNode }) => {
  if (env.NEXT_BUILD_ENV_MSW !== true) {
    return children;
  }

  return <MockProvider>{children}</MockProvider>;
};

export { MockLoader };
