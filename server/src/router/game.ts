import z from 'zod'
import { TRPCError } from '@trpc/server'
import { database, Room, tileTypes } from '../db'
import { publicProcedure, router } from '../trpc'

import { getVisibleState, initState } from '../controllers/game/state'
import { ankan, daiminkan, giri, pon, skipAndTsumo, skipChankan, tsumo } from '../controllers/game/action'

const getRoom = (username: string, started = false) => {
  const room = database.rooms.find((room) => room.host === username || room.guest === username)
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  if (started && !room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })
  return room
}

const getActiveMe = (room: Room, username: string) => {
  const me = room.host === username ? 'host' : 'guest'
  if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })
  return me
}

export const gameRouter = router({
  state: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    const room = getRoom(username)
    const me = room.host === username ? 'host' : 'guest'
    return { ...room, state: getVisibleState(room.state, me) }
  }),
  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)

    if (room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game already started' })
    room.started = true
    initState(room.state)

    tsumo(room.state, 'host', 'haiyama')
  }),

  pon: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    pon(room.state, me)
  }),

  daiminkan: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    daiminkan(room.state, me)
  }),

  ankan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    ankan(room.state, me, type, value)
  }),

  skipAndTsumo: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    skipAndTsumo(room.state, me)
  }),

  skipChankan: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    skipChankan(room.state, me)
  }),

  giri: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    giri(room.state, me, index)
  }),
})
