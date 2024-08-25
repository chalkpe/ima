import ws from 'ws'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { appRouter } from './router'
import { createContext } from './context'

const wss = new ws.Server({ port: 3000 })

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  keepAlive: { enabled: true, pingMs: 30000, pongWaitMs: 5000 },
})

console.log('✅ WebSocket Server listening on', wss.address())
process.on('SIGTERM', () => {
  handler.broadcastReconnectNotification()
  wss.close()
})
