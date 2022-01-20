# syntax=docker/dockerfile:1.0.0-experimental

FROM node:14.17.0-alpine AS build

# Allow log level to be controlled. Uses an argument name that is different
# from the existing environment variable, otherwise the environment variable
# shadows the argument.
ARG LOGLEVEL
ENV NPM_CONFIG_LOGLEVEL ${LOGLEVEL}
RUN apk update && \
  apk add python3 make build-base && \
  rm -rf /var/cache/apk/*

WORKDIR /vitalam-identity-service

# Install base dependencies
RUN npm -g install npm@latest

COPY . .
RUN npm ci --production

##################################################################################################

FROM node:14.17.0-alpine AS runtime

WORKDIR /vitalam-identity-service

COPY --from=build /vitalam-identity-service .

EXPOSE 80
CMD ["node", "./app/index.js"]
