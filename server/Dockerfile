FROM node:22-alpine

WORKDIR /app
COPY /package.json /app
COPY /package-lock.json /app

COPY /server/src /app/server/src
COPY /server/package.json /app/server
COPY /server/tsconfig.json /app/server

RUN npm ci && npm run build -w server
CMD ["npm", "run", "preview", "-w", "server"]