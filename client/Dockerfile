FROM node:22-alpine AS build

COPY /package.json /app/
COPY /package-lock.json /app/
COPY /node_modules /app/node_modules

COPY /client/index.html /app/client/
COPY /client/package.json /app/client/
COPY /client/tsconfig.json /app/client/
COPY /client/vite.config.ts /app/client/
COPY /client/src /app/client/src
COPY /client/public /app/client/public

COPY /server/package.json /app/server/
COPY /server/tsconfig.json /app/server/
COPY /server/src /app/server/src
COPY /server/prisma /app/server/prisma

WORKDIR /app
RUN npm ci && npm run generate -w server && npm run build -w client

FROM caddy:2-alpine

COPY --from=build /app/client/dist /srv
COPY /client/Caddyfile /etc/caddy/Caddyfile
