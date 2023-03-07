# syntax=docker/dockerfile:1.5

FROM node:lts-alpine AS build

# Allow log level to be controlled. Uses an argument name that is different
# from the existing environment variable, otherwise the environment variable
# shadows the argument.
ARG LOGLEVEL
ENV NPM_CONFIG_LOGLEVEL ${LOGLEVEL}
RUN apk update && \
  apk add python3 make build-base && \
  rm -rf /var/cache/apk/*

WORKDIR /dscp-identity-service

# Install base dependencies
RUN npm i -g npm@latest

COPY . .
RUN npm ci --production

##################################################################################################

FROM node:lts-alpine AS runtime

WORKDIR /dscp-identity-service

COPY --from=build /dscp-identity-service .

EXPOSE 80
CMD ["node", "./app/index.js"]
