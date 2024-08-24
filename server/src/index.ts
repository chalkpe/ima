import fastify from 'fastify'
import ws from '@fastify/websocket'
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import { appRouter, AppRouter } from './router'
import { createContext } from './context'

const server = fastify({ maxParamLength: 5000 })

server.register(ws)

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  useWSS: true,
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error('Error', path, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  keepAlive: {
    enabled: true,
    pingMs: 30000,
    pongWaitMs: 5000,
  },
})


server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
