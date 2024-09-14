import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from '@ima/server/context'

const t = initTRPC.context<Context>().create()

export const router = t.router

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts
  if (!ctx.username) throw new TRPCError({ code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' })
  return opts.next({ ctx: { username: ctx.username } })
})
