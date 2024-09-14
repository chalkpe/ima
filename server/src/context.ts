import type { VerifyPayloadType } from '@fastify/jwt'

export type ContextOptions = { payload: VerifyPayloadType | undefined }
export type Context = Awaited<{ username: string | undefined }>

export const buildContext = ({ payload }: ContextOptions): Context => {
  if (!payload || typeof payload !== 'object' || !('username' in payload) || typeof payload.username !== 'string') {
    return { username: undefined }
  }
  return {
    username: payload.username,
  }
}
