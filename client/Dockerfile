FROM node:22-alpine AS build
WORKDIR /app

COPY /package.json /app/
COPY /package-lock.json /app/
COPY /server/package.json /app/server/
COPY /client/package.json /app/client/
RUN npm ci

COPY /server/tsconfig.json /app/server/
COPY /server/src /app/server/src
COPY /server/prisma /app/server/prisma
COPY /client/index.html /app/client/
COPY /client/tsconfig.json /app/client/
COPY /client/vite.config.ts /app/client/
COPY /client/src /app/client/src
COPY /client/public /app/client/public
RUN npm run generate -w server && npm run build -w client

FROM caddy:2-alpine AS production

COPY --from=build /app/client/dist /srv
COPY /client/Caddyfile /etc/caddy/Caddyfile
