import { router } from '@ima/server/trpc'
import { gameRouter } from '@ima/server/router/game'
import { lobbyRouter } from '@ima/server/router/lobby'

export const appRouter = router({
  lobby: lobbyRouter,
  game: gameRouter,
})

export type AppRouter = typeof appRouter
