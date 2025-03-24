import { Redis } from 'iovalkey'
import { RedisPubSub } from '@soundxyz/redis-pubsub'

const pub = process.env.REDIS_HOST ? new Redis(6379, process.env.REDIS_HOST) : new Redis()
pub.on('connect', () => console.info('✅ Redis Pub connected to', `${pub.options.host}:${pub.options.port}`))
pub.on('error', (err) => console.error('❌ Redis Pub error', err))

const sub = process.env.REDIS_HOST ? new Redis(6379, process.env.REDIS_HOST) : new Redis()
sub.on('connect', () => console.info('✅ Redis Sub connected to', `${sub.options.host}:${sub.options.port}`))
sub.on('error', (err) => console.error('❌ Redis Sub error', err))

const { createChannel } = RedisPubSub({ publisher: pub, subscriber: sub })
export default createChannel
