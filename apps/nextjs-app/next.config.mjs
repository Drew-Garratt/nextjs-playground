import path from 'node:path';
import url from "node:url";
import withNextIntl from "next-intl/plugin";
import pc from "picocolors";

import { env } from "./src/env.mjs";

const workspaceRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** @type {import("next").NextConfig} */
const nextConfig = {
  ...(env.NEXT_BUILD_ENV_OUTPUT === "standalone"
    ? { output: "standalone" }
    : {}),

  experimental: {
    // @link https://nextjs.org/docs/advanced-features/output-file-tracing#caveats
    ...(env.NEXT_BUILD_ENV_OUTPUT === "standalone"
      ? { outputFileTracingRoot: workspaceRoot }
      : {}),
    testProxy: env.NEXT_BUILD_ENV_TESTPROXY,
    instrumentationHook: true,
    reactCompiler: true,

    // Prefer loading of ES Modules over CommonJS
    // @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
    // @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
    esmExternals: true,
    // Experimental monorepo support
    // @link {https://github.com/vercel/next.js/pull/22867|Original PR}
    // @link {https://github.com/vercel/next.js/discussions/26420|Discussion}
    externalDir: true,
    mdxRs: true,
  },

  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/ui"],

  logging: {
    fetches: { fullUrl: false },
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: {
    ignoreDuringBuilds: !env.NEXT_BUILD_ENV_LINT,
    // dirs: [`${__dirname}/src`],
  },
  typescript: { ignoreBuildErrors: true },

  // @link https://nextjs.org/docs/api-reference/next.config.js/rewrites
  async rewrites() {
    return [
      /*
      {
        source: `/about-us`,
        destination: '/about',
      },
      */
    ];
  },

  webpack: (config, { webpack, isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      // @link https://github.com/vercel/next.js/issues/36514#issuecomment-1112074589
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find(
      (/** @type {{ test: { test: (arg0: string) => any; }; }} */ rule) =>
        rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

let config = nextConfig;

// Next.js Configuration with `next.intl` enabled
config = withNextIntl("./src/i18n.tsx")(nextConfig);

if (
  env.NEXT_BUILD_ENV_SENTRY_ENABLED === true &&
  env.SENTRY_AUTH_TOKEN !== ""
) {
  try {
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/
    const withSentryConfig = await import("@sentry/nextjs").then(
      (mod) => mod.withSentryConfig,
    );
    // @ts-ignore cause sentry is not always following nextjs types
    config = withSentryConfig(config, {
      // Additional config options for the Sentry Webpack plugin. Keep in mind that
      // the following options are set automatically, and overriding them is not
      // recommended:
      //   release, url, org, project, authToken, configFile, stripPrefix,
      //   urlPrefix, include, ignore
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options.
      // silent: isProd, // Suppresses all logs

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
      // See the following for more information:
      // https://docs.sentry.io/product/crons/
      // https://vercel.com/docs/cron-jobs
      automaticVercelMonitors: true,

      silent: env.NEXT_BUILD_ENV_SENTRY_DEBUG === false,
    });
    console.log(`- ${pc.green("info")} Sentry enabled for this build`);
  } catch {
    console.log(`- ${pc.red("error")} Could not enable sentry, import failed`);
  }
}

if (process.env.ANALYZE === "true") {
  try {
    const withBundleAnalyzer = await import("@next/bundle-analyzer").then(
      (mod) => mod.default,
    );
    config = withBundleAnalyzer({
      enabled: true,
    })(config);
  } catch {
    // Do nothing, @next/bundle-analyzer is probably purged in prod or not installed
  }
}

export default config;
