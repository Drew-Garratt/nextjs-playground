import path from "node:path";
import url from "node:url";
import { fileURLToPath } from "url";
import withNextIntl from 'next-intl/plugin';
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

const workspaceRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** @type {import("next").NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_BUILD_ENV_OUTPUT === "standalone"
    ? { output: "standalone" }
    : {}),

  experimental: {
    // @link https://nextjs.org/docs/advanced-features/output-file-tracing#caveats
    ...(process.env.NEXT_BUILD_ENV_OUTPUT === "standalone"
      ? { outputFileTracingRoot: workspaceRoot }
      : {}),
    testProxy: process.env.TEST_PROXY === "true" ? true : false,
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
  },

  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/ui"],

  logging: {
    fetches: { fullUrl: false },
  },

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: {
    ignoreDuringBuilds: !process.env.NEXT_BUILD_ENV_LINT,
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

// Next.js Configuration with `next.intl` enabled
const nextWithIntl = withNextIntl('./src/i18n.tsx')(nextConfig);

export default nextWithIntl;
