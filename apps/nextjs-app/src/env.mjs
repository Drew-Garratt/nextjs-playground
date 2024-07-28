/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

export const truthyStrEnvValue = ["true", "1"];

const isCI = truthyStrEnvValue.includes(process.env?.CI ?? "false");
const isProd = process.env.NODE_ENV === "production";

const falseOnCi = !isCI;

/**
 * Allow to convert truthy string ('1', 'true') values to boolean
 */
export const zConvertTruthyStrToBool = (defaultValue = false) =>
  z.preprocess((val) => {
    if (val === undefined) return defaultValue;
    return truthyStrEnvValue.includes(String(val));
  }, z.boolean());

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_BUILD_ENV_OUTPUT: z
      .enum(["standalone", "classic"], {
        description:
          "For standalone mode: https://nextjs.org/docs/pages/api-reference/next-config-js/output",
      })
      .default("classic"),
    NEXT_BUILD_ENV_TSCONFIG: z
      .string()
      .endsWith(".json")
      .default("tsconfig.json"),
    NEXT_BUILD_ENV_TESTPROXY: zConvertTruthyStrToBool(false),
    NEXT_BUILD_ENV_TYPECHECK: zConvertTruthyStrToBool(falseOnCi),
    NEXT_BUILD_ENV_LINT: zConvertTruthyStrToBool(falseOnCi),
    NEXT_BUILD_ENV_SOURCEMAPS: zConvertTruthyStrToBool(isProd),
    NEXT_BUILD_ENV_CSP: zConvertTruthyStrToBool(true),
    NEXT_BUILD_ENV_CI: zConvertTruthyStrToBool(isCI),
    NEXT_BUILD_ENV_BUILD_ID: z
      .string()
      .default(isProd ? new Date().toISOString().replace(":", "_") : ""),
    // --------------------------------------------------------------------
    // Sentry related
    // --------------------------------------------------------------------
    NEXT_BUILD_ENV_SENTRY_ENABLED: zConvertTruthyStrToBool(false),
    NEXT_BUILD_ENV_SENTRY_DEBUG: zConvertTruthyStrToBool(false),
    NEXT_BUILD_ENV_SENTRY_TRACING: zConvertTruthyStrToBool(false),
  },

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    SENTRY_AUTH_TOKEN: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
