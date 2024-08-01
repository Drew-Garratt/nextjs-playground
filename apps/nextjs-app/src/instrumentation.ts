/* eslint no-restricted-properties: 0 no-restricted-imports: 0 */

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_BUILD_ENV_SENTRY_ENABLED === "true"
  ) {
    await import("@/sentry.server.config");
  }

  if (
    process.env.NEXT_RUNTIME === "edge" &&
    process.env.NEXT_BUILD_ENV_SENTRY_ENABLED === "true"
  ) {
    await import("@/sentry.edge.config");
  }
}
