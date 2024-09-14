import fs from 'fs'
import path from 'path'

import fp from 'fastify-plugin'
import fastifySecureSession from '@fastify/secure-session'
import fastifyPassport from '@fastify/passport'
import { Strategy } from 'passport-twitter'
import { prisma } from '@ima/server/db'
import { Prisma } from '@prisma/client'

const key = fs.readFileSync(path.join(__dirname, '..', '..', 'secret-key'))

const consumerKey = process.env.TWITTER_API_KEY!
const consumerSecret = process.env.TWITTER_API_SECRET!
const callbackURL = process.env.TWITTER_CALLBACK_URL!
const redirectURL = process.env.TWITTER_REDIRECT_URL!

const authPath = '/api/twitter/auth'
const callbackPath = '/api/twitter/callback'

export default fp((server, _, done) => {
  server.register(fastifySecureSession, { key, cookie: { path: '/' } })
  server.register(fastifyPassport.initialize())
  server.register(fastifyPassport.secureSession())

  fastifyPassport.use(
    new Strategy({ consumerKey, consumerSecret, callbackURL }, async (token, tokenSecret, profile, done) => {
      const { id, displayName, username } = profile
      try {
        const user = await prisma.user.findFirst({ where: { id } })
        if (user) {
          done(null, await prisma.user.update({ where: { id }, data: { displayName, username, token, tokenSecret } }))
        } else {
          done(null, await prisma.user.create({ data: { id, displayName, username, token, tokenSecret } }))
        }
      } catch (error) {
        console.error('❌ Twitter error', error)
        done(error)
      }
    })
  )

  fastifyPassport.registerUserSerializer(async (user: Prisma.UserSelect) => user.id)
  fastifyPassport.registerUserDeserializer(async (id: string) => await prisma.user.findFirst({ where: { id } }))

  server.get(authPath, { preValidation: fastifyPassport.authenticate('twitter') }, () => {})
  server.get(callbackPath, { preValidation: fastifyPassport.authenticate('twitter') }, async (req, reply) => {
    if (!req.user) return reply.redirect(redirectURL)
    const { id, displayName, username } = req.user
    return reply.redirect(`${redirectURL}/?token=${await reply.jwtSign({ id, displayName, username })}`)
  })

  done()
})

declare module 'fastify' {
  interface PassportUser extends Prisma.UserSelect {
    _: unknown
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: Prisma.UserSelect
  }
}
