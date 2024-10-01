import fs from 'fs'
import path from 'path'

import fp from 'fastify-plugin'
import fastifySecureSession from '@fastify/secure-session'
import fastifyPassport from '@fastify/passport'

import { prisma } from '@ima/server/db'
import { Prisma } from '@prisma/client'

const key = fs.readFileSync(path.join(__dirname, '..', '..', 'secret-key'))

export default fp((server, _, done) => {
  server.register(fastifySecureSession, { key, cookie: { path: '/' } })
  server.register(fastifyPassport.initialize())
  server.register(fastifyPassport.secureSession())

  fastifyPassport.registerUserSerializer(async (user: Prisma.UserGetPayload<{ select: { id: true } }>) => user.id)
  fastifyPassport.registerUserDeserializer(async (id: string) => await prisma.user.findFirst({ where: { id } }))

  done()
})

type User = Prisma.UserGetPayload<{ select: { id: true; displayName: true } }>

declare module 'fastify' {
  interface PassportUser extends User {
    _: unknown
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: User
  }
}
