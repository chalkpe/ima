import z from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { publicProcedure, router } from '@ima/server/trpc'
import { database, ee } from '@ima/server/db'

import {
  confirmScoreboard,
  getRemainingTileCount,
  getVisibleState,
  initState,
} from '@ima/server/controllers/game/state'
import {
  ankan,
  callRon,
  callTsumo,
  chi,
  daiminkan,
  gakan,
  giri,
  pon,
  riichi,
  skipAndTsumo,
  skipChankan,
  tsumo,
} from '@ima/server/controllers/game/action'
import { tileTypes } from '@ima/server/helpers/tile'
import { createInitialState, getActiveMe, getOpponent } from '@ima/server/helpers/game'
import type { StateChangeType } from '@ima/server/types/game'

const getRoom = (username: string, started?: boolean) => {
  const room = database.rooms.find((room) => room.host === username || room.guest === username)
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  if (started === true && !room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })
  if (started === false && room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game already started' })
  return room
}

export const gameRouter = router({
  state: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    const room = getRoom(username)
    const me = room.host === username ? 'host' : 'guest'
    return { ...room, state: getVisibleState(room.state, me) }
  }),

  onStateChange: publicProcedure.subscription((opts) => {
    const { username } = opts.ctx
    const room = getRoom(username)

    return observable<StateChangeType>((emit) => {
      const onUpdate = (host: string, type: StateChangeType) => host === room.host && emit.next(type)

      ee.on('update', onUpdate)
      return () => ee.off('update', onUpdate)
    })
  }),

  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, false)
    room.started = true

    initState(room.state)
    room.state.turn = Math.round(Math.random()) ? 'host' : 'guest'
    room.state[room.state.turn].wind = 'east'
    room.state[getOpponent(room.state.turn)].wind = 'west'
    tsumo(room.state, room.state.turn, 'haiyama')

    ee.emit('update', room.host, 'start')
  }),

  getRemainingTileCount: publicProcedure
    .input(z.object({ type: z.enum(tileTypes), value: z.number() }))
    .query((opts) => {
      const { username } = opts.ctx
      const { type, value } = opts.input

      const room = getRoom(username, true)
      const me = room.host === username ? 'host' : 'guest'
      return getRemainingTileCount(room.state, me, { type, value })
    }),

  pon: publicProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation((opts) => {
    const { username } = opts.ctx
    const { tatsu } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    pon(room.state, me, tatsu)

    ee.emit('update', room.host, 'pon')
  }),

  chi: publicProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation((opts) => {
    const { username } = opts.ctx
    const { tatsu } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    chi(room.state, me, tatsu)

    ee.emit('update', room.host, 'chi')
  }),

  daiminkan: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    daiminkan(room.state, me)

    ee.emit('update', room.host, 'kan')
  }),

  ankan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    ankan(room.state, me, type, value)

    ee.emit('update', room.host, 'kan')
  }),

  gakan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    gakan(room.state, me, type, value)

    ee.emit('update', room.host, 'kan')
  }),

  skipAndTsumo: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    skipAndTsumo(room.state, me)

    ee.emit('update', room.host, 'update')
  }),

  skipChankan: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    skipChankan(room.state, me)

    ee.emit('update', room.host, 'update')
  }),

  callTsumo: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    callTsumo(room.state, me)

    ee.emit('update', room.host, 'tsumo')
  }),

  callRon: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    callRon(room.state, me)

    ee.emit('update', room.host, 'ron')
  }),

  giri: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    giri(room.state, me, index)

    ee.emit('update', room.host, 'update')
  }),

  riichi: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    riichi(room.state, me, index)

    ee.emit('update', room.host, 'riichi')
  }),

  confirmScoreboard: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const result = confirmScoreboard(room.state, room.host === username ? 'host' : 'guest')

    if (result === 'end') {
      room.started = false
      room.hostReady = false
      room.guestReady = false
      room.state = createInitialState()
    }

    ee.emit('update', room.host, result)
  }),
})
