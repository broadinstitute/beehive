ARG NODE_VERSION='16'
ARG DISTRO='alpine'

# Get all dependencies
FROM node:${NODE_VERSION}-${DISTRO} as deps
WORKDIR /app

ADD package.json package-lock.json .npmrc ./
RUN npm clean-install

# Pare down dependencies for production
FROM node:${NODE_VERSION}-${DISTRO} as production-deps
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD package.json package-lock.json .npmrc ./
RUN npm prune --production

# Build with all dependencies
FROM node:${NODE_VERSION}-${DISTRO} as build
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN npm run build

# Run with production dependencies
#   - Remix's built-in server is specifically production-ready
#     https://remix.run/docs/en/v1/other-api/serve#remix-app-server
#   - Use blessed image from DSP AppSec
#     https://github.com/broadinstitute/dsp-appsec-blessed-images
FROM us.gcr.io/broad-dsp-gcr-public/base/nodejs:${NODE_VERSION}-${DISTRO} as runtime
WORKDIR /app

ARG BUILD_VERSION

RUN apk --no-cache -U upgrade

ENV NODE_ENV=production
ENV PORT=80
ENV BUILD_VERSION=${BUILD_VERSION:-unknown}

COPY --chown=node:node --from=production-deps /app/node_modules /app/node_modules

COPY --chown=node:node --from=build /app/build /app/build
COPY --chown=node:node --from=build /app/public /app/public
ADD --chown=node:node . .

USER node

EXPOSE 80/tcp

CMD ["npm", "run", "start"]
