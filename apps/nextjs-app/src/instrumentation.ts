import { env } from "~/env.mjs";

export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    env.NEXT_BUILD_ENV_SENTRY_ENABLED === true
  ) {
    await import("@/sentry.server.config");
  }

  if (
    process.env.NEXT_RUNTIME === "edge" &&
    env.NEXT_BUILD_ENV_SENTRY_ENABLED === true
  ) {
    await import("@/sentry.edge.config");
  }

  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    env.NEXT_BUILD_ENV_TESTPROXY === true
  ) {
    const { server } = await import("~/mocks/node");
    server.listen({
      onUnhandledRequest: "bypass",
    });
  }
}
