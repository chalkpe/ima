import { publicProcedure, router } from '@ima/server/trpc'

export const entryRouter = router({
  me: publicProcedure.query(async (opts) => {
    return { username: opts.ctx.username }
  }),
})
