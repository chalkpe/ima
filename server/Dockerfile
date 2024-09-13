FROM node:22-alpine AS build

COPY /package.json /app/
COPY /package-lock.json /app/
COPY /node_modules /app/node_modules

COPY /server/package.json /app/server/
COPY /server/tsconfig.json /app/server/
COPY /server/src /app/server/src
COPY /server/prisma /app/server/prisma

WORKDIR /app
RUN npm ci && npm run generate -w server && npm run build -w server && npm prune --omit=dev

FROM node:22-alpine

COPY --from=build /app/package.json /app/
COPY --from=build /app/node_modules /app/node_modules

COPY --from=build /app/server/package.json /app/server/
COPY --from=build /app/server/dist /app/server/dist
COPY --from=build /app/server/prisma /app/server/prisma

WORKDIR /app
CMD ["npm", "run", "start", "-w", "server"]