import { database } from '../db'
import { publicProcedure, router } from '../trpc'
import { gameRouter } from './game'
import { lobbyRouter } from './lobby'

setInterval(() => {
  database.rooms = database.rooms.filter((room) => {
    const ping = database.lastPing.get(room.host)
    if (ping && Date.now() - ping <= 10000) return true
    database.lastPing.delete(room.host)
    console.log('Room removed:', room.host)
    return false
  })
}, 30000).unref()

export const appRouter = router({
  lobby: lobbyRouter,
  game: gameRouter,
  ping: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    if (username) database.lastPing.set(username, Date.now())
    return 'pong'
  }),
})

export type AppRouter = typeof appRouter
