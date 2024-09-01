import z from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { publicProcedure, router } from '../trpc'

import { database, ee } from '../db'

import { getRemainingTileCount, getVisibleState, initState } from '../controllers/game/state'
import { ankan, chi, daiminkan, gakan, giri, pon, riichi, skipAndTsumo, skipChankan, tsumo } from '../controllers/game/action'

import { tileTypes } from '../helpers/tile'
import { getActiveMe } from '../helpers/game'

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

    return observable<void>((emit) => {
      const onUpdate = (host: string) => host === room.host && emit.next()

      ee.on('update', onUpdate)
      return () => ee.off('update', onUpdate)
    })
  }),

  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, false)
    room.started = true

    initState(room.state)
    tsumo(room.state, 'host', 'haiyama')

    ee.emit('update', room.host)
  }),

  getRemainingTileCount: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).query((opts) => {
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

    ee.emit('update', room.host)
  }),

  chi: publicProcedure.input(z.object({ tatsu: z.tuple([z.number(), z.number()]) })).mutation((opts) => {
    const { username } = opts.ctx
    const { tatsu } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    chi(room.state, me, tatsu)

    ee.emit('update', room.host)
  }),

  daiminkan: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    daiminkan(room.state, me)

    ee.emit('update', room.host)
  }),

  ankan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    ankan(room.state, me, type, value)

    ee.emit('update', room.host)
  }),

  gakan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    gakan(room.state, me, type, value)

    ee.emit('update', room.host)
  }),

  skipAndTsumo: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    skipAndTsumo(room.state, me)

    ee.emit('update', room.host)
  }),

  skipChankan: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    skipChankan(room.state, me)

    ee.emit('update', room.host)
  }),

  giri: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    giri(room.state, me, index)

    ee.emit('update', room.host)
  }),

  riichi: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username, true)
    const me = getActiveMe(room, username)
    riichi(room.state, me, index)

    ee.emit('update', room.host)
  }),
})
