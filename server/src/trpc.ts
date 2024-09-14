import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from '@ima/server/context'

const t = initTRPC.context<Context>().create()

export const router = t.router

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { username: ctx.username } })
})
