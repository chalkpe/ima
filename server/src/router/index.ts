import { router } from '@ima/server/trpc'
import { gameRouter } from '@ima/server/router/game'
import { lobbyRouter } from '@ima/server/router/lobby'
import { entryRouter } from '@ima/server/router/entry'

export const appRouter = router({
  entry: entryRouter,
  lobby: lobbyRouter,
  game: gameRouter,
})

export type AppRouter = typeof appRouter
