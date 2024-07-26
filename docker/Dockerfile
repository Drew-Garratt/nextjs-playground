ARG NODE_VERSION=22.5.1
ARG ALPINE_VERSION=3.20

#############################################################
# Stage 1 - App extraction / pruning                        #
#############################################################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as app-builder

RUN apk add --no-cache git jq && corepack enable

WORKDIR /app

COPY --link package.json turbo.json ./

RUN TURBO_VERSION=$(cat package.json | jq '.devDependencies["turbo"]' -r) npm i -g turbo@${TURBO_VERSION}

COPY --link . .

# https://turbo.build/repo/docs/handbook/deploying-with-docker
RUN turbo prune --scope=nextjs-app --docker --out-dir=./out/nextjs-app/

#############################################################
# Stage 2 - App installation                                #
#############################################################

FROM app-builder as app-installer

# This will disable runtime env validation
# see ./src/config/server-runtime-env.config.mjs
ENV NEXTJS_PRODUCTION_PHASE=build

ENV NEXT_BUILD_ENV_TYPECHECK=false
ENV NEXT_BUILD_ENV_LINT=false
ENV NEXT_BUILD_ENV_OUTPUT=standalone
# ENV NEXT_BUILD_ENV_SENTRY_ENABLED=false
# ENV NEXT_BUILD_ENV_SENTRY_TRACING=false

ENV TZ=Europe/Brussels

# Disabling some well-known postinstall scripts
ENV HUSKY=0

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --link .gitignore ./
COPY --from=app-builder --link /app/out/nextjs-app/json/ .
COPY --from=app-builder --link /app/out/nextjs-app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --P --no-optional

# Build the project
COPY --from=app-builder /app/out/nextjs-app/full/ .
COPY --link .gitignore turbo.json tsconfig.base.json ./

RUN pnpm turbo run build --filter=nextjs-app...

#############################################################
# Stage 3 - App runner                                      #
#############################################################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as app-runner

# Bort PORT / HOSTNAME envs are respected by nextjs start/dev.
ENV HOSTNAME=0.0.0.0
ENV PORT=${NEXTJS_APP_PORT:-3000}
ENV TZ=Europe/Brussels

RUN apk add --no-cache tzdata bash && corepack enable

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

USER nextjs

COPY --from=app-installer --chown=nextjs:nodejs /app/apps/nextjs-app/next.config.mjs \
                    /app/apps/nextjs-app/package.json \
                    ./

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=app-installer --chown=nextjs:nodejs /app/apps/nextjs-app/.next/standalone ./
COPY --from=app-installer --chown=nextjs:nodejs /app/apps/nextjs-app/.next/static ./apps/nextjs-app/.next/static
COPY --from=app-installer --chown=nextjs:nodejs /app/apps/nextjs-app/public ./apps/nextjs-app/public

# BugFix Next 15 standalone mode failes to copy package file
COPY --from=app-installer --chown=nextjs:nodejs /app/apps/nextjs-app/package.json ./apps/nextjs-app/package.json

EXPOSE ${PORT}

CMD ["node", "apps/nextjs-app/server.js"]
