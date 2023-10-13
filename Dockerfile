ARG NODE_VERSION='18'
ARG DISTRO='alpine'

# base node image
FROM us.gcr.io/broad-dsp-gcr-public/base/nodejs:${NODE_VERSION}-${DISTRO} as base

# set for base and all layer that inherit from it
ENV NODE_ENV=production

RUN apk --no-cache -U upgrade

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /app

ADD package.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /app

# This argo needs to be in here so that it can be referenced by the ENV
ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION:-unknown}
ENV PORT=80

COPY --chown=node:node --from=production-deps /app/node_modules /app/node_modules

COPY --chown=node:node --from=build /app/build /app/build
COPY --chown=node:node --from=build /app/public /app/public
ADD --chown=node:node . .

USER node

EXPOSE 80/tcp

CMD ["npm", "run", "start"]
