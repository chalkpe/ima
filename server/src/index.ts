import ws from 'ws'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { appRouter } from '@ima/server/router'
import { createContext } from '@ima/server/context'

const wss = new ws.Server({ port: 5172 })

wss.on('listening', () => {
  console.log('✅ WebSocket Server listening on', wss.address())
})

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
  onError(obj) {
    console.error(obj.type, obj.path, obj.ctx?.username, obj.error.message)
    // console.error(obj.error.stack)
  },
  keepAlive: { enabled: true, pingMs: 30000, pongWaitMs: 5000 },
})

const onCleanup = () => {
  handler.broadcastReconnectNotification()
  wss.close()
  process.exit()
}

process.on('SIGTERM', onCleanup)
process.on('SIGINT', onCleanup)
