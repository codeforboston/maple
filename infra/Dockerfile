FROM node:16-alpine as next

USER root
RUN apk update && apk add python3 build-base

WORKDIR /app

COPY package.json yarn.lock ./
COPY functions/package.json functions/yarn.lock ./functions/
RUN chown -R node:node .

USER node
RUN yarn install

FROM alexjball/firebase-tools:latest-node-16 as firebase

USER root
WORKDIR /app
COPY --from=next /app ./
RUN chown node:node .
USER node