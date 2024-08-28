import z from 'zod'
import { publicProcedure, router } from '../trpc'
import { Room, database } from '../db'
import { TRPCError } from '@trpc/server'

export const lobbyRouter = router({
  list: publicProcedure.query(() => database.rooms.map((room) => ({ host: room.host, guest: room.guest, started: room.started }))),

  create: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx
    if (database.rooms.find((room) => room.host === username)) {
      throw new TRPCError({ code: 'CONFLICT', message: '이미 호스트가 존재합니다.' })
    }

    const room: Room = {
      host: username,
      hostReady: false,
      guest: '',
      guestReady: false,
      started: false,
      state: {
        host: {
          river: [],
          hand: { closed: [], called: [], tsumo: undefined },
          decisions: [],
          isAfterCall: false,
        },
        guest: {
          river: [],
          hand: { closed: [], called: [], tsumo: undefined },
          decisions: [],
          isAfterCall: false,
        },
        wall: { tiles: [], tilesCount: 0, kingTiles: [], supplementTiles: [], doraCount: 1 },
        turn: 'host',
      },
    }

    database.rooms.push(room)
  }),

  leave: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '호스트를 찾을 수 없습니다.' })


    if (room.host === username) {
      room.host = room.guest
      room.guest = ''
    } else {
      room.guest = ''
    }

    if (room.host === '') {
      database.rooms = database.rooms.filter((r) => r !== room)
    }
  }),

  join: publicProcedure.input(z.object({ host: z.string() })).mutation((opts) => {
    const { username } = opts.ctx
    const { host } = opts.input

    if (host === username) throw new TRPCError({ code: 'BAD_REQUEST', message: '호스트와 같은 이름입니다.' })

    const room = database.rooms.find((room) => room.host === host)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '호스트를 찾을 수 없습니다.' })

    if (room.guest) throw new TRPCError({ code: 'FORBIDDEN', message: '이미 게스트가 존재합니다.' })

    room.guest = username
    database.rooms = database.rooms.filter((room) => room.host !== username)
  }),

  room: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '방을 찾을 수 없습니다.' })

    return room
  }),

  ready: publicProcedure.input(z.object({ ready: z.boolean() })).mutation((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: '방을 찾을 수 없습니다.' })

    if (room.host === username) room.hostReady = opts.input.ready
    else room.guestReady = opts.input.ready
  }),
})
