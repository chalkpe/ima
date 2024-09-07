import ws from 'ws'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { appRouter } from '@ima/server/router'
import { createContext } from '@ima/server/context'

const wss = new ws.Server({ port: 5172 })

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  onError(obj) {
    console.error(obj.type, obj.path, obj.ctx?.username, obj.error.message)
  },
  keepAlive: { enabled: true, pingMs: 30000, pongWaitMs: 5000 },
})

console.log('✅ WebSocket Server listening on', wss.address())
process.on('SIGTERM', () => {
  handler.broadcastReconnectNotification()
  wss.close()
})
