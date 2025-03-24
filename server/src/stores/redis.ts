import { Redis } from 'iovalkey'

const redis = process.env.REDIS_HOST ? new Redis(6379, process.env.REDIS_HOST) : new Redis()
redis.on('connect', () => console.info('✅ Redis connected to', `${redis.options.host}:${redis.options.port}`))
redis.on('error', (err) => console.error('❌ Redis error', err))

export default redis
