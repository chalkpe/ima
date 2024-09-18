FROM node:22-alpine AS build

COPY /package.json /app/
COPY /package-lock.json /app/
COPY /server/package.json /app/server/
COPY /client/package.json /app/client/

WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN npm ci

COPY /server/tsconfig.json /app/server/
COPY /server/src /app/server/src
COPY /server/prisma /app/server/prisma
COPY /client/index.html /app/client/
COPY /client/tsconfig.json /app/client/
COPY /client/vite.config.ts /app/client/
COPY /client/src /app/client/src
COPY /client/public /app/client/public

WORKDIR /app
RUN npm run generate -w server && npm run build -w client

FROM caddy:2-alpine AS production
RUN apk add --no-cache curl

COPY --from=build /app/client/dist /srv
COPY /client/Caddyfile /etc/caddy/Caddyfile
