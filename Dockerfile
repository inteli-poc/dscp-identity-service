# syntax=docker/dockerfile:1.0.0-experimental

FROM node:14.17.0-alpine AS build

# Allow log level to be controlled. Uses an argument name that is different
# from the existing environment variable, otherwise the environment variable
# shadows the argument.
ARG LOGLEVEL
ENV NPM_CONFIG_LOGLEVEL ${LOGLEVEL}
RUN apk update && \
  apk add python make build-base && \
  rm -rf /var/cache/apk/*

WORKDIR /vitalam-identity-service

# Install base dependencies
COPY . .
RUN npm install

##################################################################################################

FROM node:14.17.0-alpine AS runtime

# Install base dependencies
RUN npm -g install npm@latest

COPY --from=build /vitalam-identity-service .

RUN npm install

EXPOSE 80
CMD ["node", "./app/index.js"]
