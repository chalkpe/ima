import { z } from 'zod'
import { publicProcedure, router } from './trpc'
import { observable } from '@trpc/server/observable'

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    return [{ id: 1, name: 'John' }]
  }),
  userById: publicProcedure.input(z.string()).query(async (opts) => {
    const id = opts.input
    return { id, name: 'John' }
  }),
  randomNumber: publicProcedure.subscription(() => {
    return observable<{ randomNumber: number }>((emit) => {
      const timer = setInterval(() => {
        emit.next({ randomNumber: Math.random() })
      }, 1000)
      return () => {
        clearInterval(timer)
      }
    })
  }),
})

export type AppRouter = typeof appRouter
