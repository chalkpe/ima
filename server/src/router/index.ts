import { database } from '@ima/server/db'
import { publicProcedure, router } from '@ima/server/trpc'
import { gameRouter } from '@ima/server/router/game'
import { lobbyRouter } from '@ima/server/router/lobby'

// setInterval(() => {
//   database.rooms = database.rooms.filter((room) => {
//     const ping = database.lastPing.get(room.host)
//     if (ping && Date.now() - ping <= 10000) return true
//     database.lastPing.delete(room.host)
//     console.log('Room removed:', room.host)
//     return false
//   })
// }, 30000).unref()

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
