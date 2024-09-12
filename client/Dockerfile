FROM node:22-alpine

WORKDIR /app
COPY /package.json /app
COPY /package-lock.json /app
COPY /node_modules /app/node_modules

COPY /client/src /app/client/src
COPY /client/public /app/client/public
COPY /client/index.html /app/client
COPY /client/package.json /app/client
COPY /client/tsconfig.json /app/client
COPY /client/vite.config.ts /app/client

COPY /server/src /app/server/src
COPY /server/package.json /app/server
COPY /server/tsconfig.json /app/server

RUN npm ci && npm run build -w client
CMD ["npm", "run", "preview", "-w", "client"]