import react from "@vitejs/plugin-react";
import magicalSvg from "vite-plugin-magical-svg";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const testFiles = ["./src/**/*.test.{js,jsx,ts,tsx}"];

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    magicalSvg({
      target: "react",
      svgo: false,
    }),
  ],
  cacheDir: "../../.cache/vitest/nextjs-app",
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      name: "chromium",
    },
    globals: true,
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
        ssr: { enabled: true },
      },
    },
    typecheck: {
      enabled: false,
    },
    // threads is good, vmThreads is faster (perf++) but comes with possible memory leaks
    // @link https://vitest.dev/config/#vmthreads
    pool: "threads",
    poolOptions: {
      vmThreads: {
        // useAtomics -> perf+
        // @link https://vitest.dev/config/#pooloptions-threads-useatomics
        useAtomics: true,
      },
      threads: {
        // minThreads: 4,
        // maxThreads: 16,
        // useAtomics -> perf+
        // @link https://vitest.dev/config/#pooloptions-threads-useatomics
        useAtomics: true,
        // isolate to false makes perf++ but comes with limitations
        // @link https://vitest.dev/config/#pooloptions-threads-isolate
        isolate: true,
      },
    },
    environmentMatchGlobs: [
      ["**/*.ts", "node"],
      ["**/*.tsx", "jsdom"],
    ],
    passWithNoTests: false,
    setupFiles: "./test-utils/setup-vitest.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "clover"],
      extension: ["js", "jsx", "ts", "tsx"],
    },
    include: testFiles,
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    // css: true,
    // To mimic Jest behaviour regarding mocks.
    // @link https://vitest.dev/config/#clearmocks
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
  },
});
