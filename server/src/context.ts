import type { VerifyPayloadType } from '@fastify/jwt'

export type ContextOptions = { payload: VerifyPayloadType | undefined }
export type Context = Awaited<{ id: string | undefined }>

export const buildContext = ({ payload }: ContextOptions): Context => {
  if (!payload || typeof payload !== 'object' || !('id' in payload) || typeof payload.id !== 'string') {
    return { id: undefined }
  }
  return {
    id: payload.id,
  }
}
