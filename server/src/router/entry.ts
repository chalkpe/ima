import { publicProcedure, router } from '@ima/server/trpc'

export const entryRouter = router({
  me: publicProcedure.query(async (opts) => {
    return { id: opts.ctx.id }
  }),
})
