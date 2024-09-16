import 'dotenv/config'

import fastify from 'fastify'
import trpc from '@ima/server/plugins/trpc'
import twitter from '@ima/server/plugins/twitter'

const server = fastify()

server.register(trpc)
server.register(twitter)

server.listen({ host: '0.0.0.0', port: 5172 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.info('✅ Fastify Server listening on', address)
  }
})

const onCleanup = () => {
  server.close()
  process.exit()
}

process.on('SIGTERM', onCleanup)
process.on('SIGINT', onCleanup)
