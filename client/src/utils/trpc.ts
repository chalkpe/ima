import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@ima/server/router'

export const trpc = createTRPCReact<AppRouter>()
