import fp from 'fastify-plugin'
import fastifyPassport from '@fastify/passport'
import { Strategy } from 'passport-twitter'
import { prisma } from '@ima/server/db'

const consumerKey = process.env.TWITTER_API_KEY!
const consumerSecret = process.env.TWITTER_API_SECRET!
const callbackURL = process.env.TWITTER_CALLBACK_URL!
const redirectURL = process.env.TWITTER_REDIRECT_URL!

const authPath = '/api/twitter/auth'
const callbackPath = '/api/twitter/callback'

export default fp((server, _, done) => {
  fastifyPassport.use(
    'twitter',
    new Strategy({ consumerKey, consumerSecret, callbackURL }, async (token, tokenSecret, profile, done) => {
      const { id: twitterId, displayName, username } = profile
      const id = `twitter:${twitterId}`
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

  server.get(authPath, { preValidation: fastifyPassport.authenticate('twitter') }, () => {})
  server.get(callbackPath, { preValidation: fastifyPassport.authenticate('twitter') }, async (req, reply) => {
    if (!req.user) return reply.redirect(redirectURL)
    const { id, displayName } = req.user
    return reply.redirect(`${redirectURL}/?token=${await reply.jwtSign({ id, displayName })}`)
  })

  done()
})
