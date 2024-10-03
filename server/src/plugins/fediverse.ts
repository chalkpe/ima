import fp from 'fastify-plugin'
import fastifyPassport from '@fastify/passport'
import FediverseStrategy from '@ima/server/plugins/fediverse-strategy'

const authPath = '/api/fediverse/auth'
const callbackPath = '/api/fediverse/callback'

const redirectUrl = process.env.TWITTER_REDIRECT_URL!

export default fp((server, _, done) => {
  fastifyPassport.use(
    'fediverse',
    new FediverseStrategy({
      redirectUrl,
      callbackPath,
      scopes: ['read'],
    })
  )

  server.get(authPath, { preValidation: fastifyPassport.authenticate('fediverse') }, () => {})
  server.get(
    `${callbackPath}/:domain`,
    { preValidation: fastifyPassport.authenticate('fediverse') },
    async (req, reply) => {
      if (!req.user) return reply.redirect(redirectUrl)
      const { id, displayName } = req.user
      return reply.redirect(`${redirectUrl}/?token=${await reply.jwtSign({ id, displayName })}`)
    }
  )

  done()
})
