import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'

export function createContext({ req, res, info }: CreateWSSContextFnOptions) {
  const username = info.connectionParams?.username ?? 'guest'
  return { req, res, username }
}

export type Context = Awaited<ReturnType<typeof createContext>>
