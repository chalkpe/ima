import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const username = undefined

  console.log(req.user, req.session)
  return { req, res, username }
}

export type Context = Awaited<ReturnType<typeof createContext>>
