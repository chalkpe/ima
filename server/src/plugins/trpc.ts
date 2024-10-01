import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import fastifyWebsocket from '@fastify/websocket'

import { buildContext } from '@ima/server/context'
import { AppRouter, appRouter } from '@ima/server/router'
import { CreateFastifyContextOptions, fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'

export default fp((server, _, done) => {
  server.register(fastifyJwt, { secret: process.env.JWT_SECRET!, decoratorName: 'jwt' })
  server.register(fastifyWebsocket)
  server.register(fastifyTRPCPlugin, {
    prefix: '/server',
    useWSS: true,
    keepAlive: { enabled: true, pingMs: 30000, pongWaitMs: 5000 },
    trpcOptions: {
      router: appRouter,
      createContext: ({ info }: CreateFastifyContextOptions) => {
        const token = info.connectionParams?.token
        if (!token) return buildContext({ payload: undefined })
        try {
          return buildContext({ payload: server.jwt.verify(token) })
        } catch (err: unknown) {
          console.error(err)
          return buildContext({ payload: undefined })
        }
      },
      onError({ type, path, ctx, error }) {
        console.error('❌ tRPC error', type, path, ctx?.id, error.message)
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  })
  done()
})
