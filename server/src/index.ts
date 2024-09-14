import 'dotenv/config'

import fs from 'fs'
import path from 'path'

import fastify from 'fastify'
import ws from '@fastify/websocket'

import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'

import { appRouter } from '@ima/server/router'
import { createContext } from '@ima/server/context'

import { Strategy } from 'passport-twitter'
import fastifyPassport from '@fastify/passport'
import fastifySecureSession from '@fastify/secure-session'
import { prisma } from '@ima/server/db'
import { Prisma } from '@prisma/client'

const server = fastify()

server.register(fastifySecureSession, {
  cookie: { path: '/' },
  key: fs.readFileSync(path.join(__dirname, '..', 'secret-key')),
})
server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession({ keepSessionInfo: true }))

fastifyPassport.use(
  new Strategy(
    {
      consumerKey: process.env['TWITTER_API_KEY']!,
      consumerSecret: process.env['TWITTER_API_SECRET']!,
      callbackURL: 'http://localhost:5173/api/twitter/callback',
    },
    async (token, tokenSecret, profile, done) => {
      const { id, displayName, username } = profile
      try {
        done(
          null,
          (await prisma.user.findFirst({ where: { id } })) ||
            (await prisma.user.create({ data: { id, displayName, username, token, tokenSecret } }))
        )
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
)

fastifyPassport.registerUserSerializer(async (user: Prisma.UserSelect) => user.id)
fastifyPassport.registerUserDeserializer(async (id: string) => await prisma.user.findFirst({ where: { id } }))

server.get('/api/twitter/auth', { preValidation: fastifyPassport.authenticate('twitter') }, () => {})
server.get('/api/twitter/callback', { preValidation: fastifyPassport.authenticate('twitter') }, (_, reply) =>
  reply.redirect('http://localhost:5173')
)

server.register(ws)
server.register(fastifyTRPCPlugin, {
  prefix: '/server',
  useWSS: true,
  keepAlive: { enabled: true, pingMs: 30000, pongWaitMs: 5000 },
  trpcOptions: { router: appRouter, createContext },
})

server.listen({ port: 5172 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('✅ Fastify Server listening on', address)
})

const onCleanup = () => {
  server.close()
  process.exit()
}

process.on('SIGTERM', onCleanup)
process.on('SIGINT', onCleanup)
