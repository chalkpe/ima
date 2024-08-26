import { TRPCError } from '@trpc/server'
import { availableTiles, database, GameState, Tile } from '../db'
import { publicProcedure, router } from '../trpc'
import z from 'zod'

export const gameRouter = router({
  state: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })

    const opponent = room.host === username ? 'guest' : 'host'
    const backTile: Tile = { type: 'back', value: 0, attribute: 'normal', background: 'white' }

    return {
      ...room,
      state: {
        ...room.state,
        [opponent]: {
          ...room.state[opponent],
          hand: {
            closed: room.state[opponent].hand.closed.map(() => backTile),
            called: room.state[opponent].hand.called,
            tsumo: room.state[opponent].hand.tsumo ? backTile : undefined,
          },
        },
        wall: {
          ...room.state.wall,
          tiles: room.state.wall.tiles.map(() => backTile),
          kingTiles: room.state.wall.kingTiles.map((tile, index) =>
            [9, 7, 5, 3, 1].slice(0, room.state.wall.doraCount).includes(index) ? tile : backTile
          ),
        },
      } satisfies GameState,
    }
  }),
  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
    if (room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game already started' })

    const tiles = availableTiles.slice()
    for (let i = tiles.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[rand]] = [tiles[rand], tiles[i]]
    }

    room.state.wall.kingTiles = tiles.splice(0, 14)
    room.state.wall.supplementTiles = []

    room.state.host.hand.closed = []
    room.state.guest.hand.closed = []
    ;[4, 4, 4, 1].forEach((count) => {
      room.state.host.hand.closed.push(...tiles.splice(0, count))
      room.state.guest.hand.closed.push(...tiles.splice(0, count))
    })

    room.state.host.hand.tsumo = tiles.splice(0, 1)[0]
    room.state.wall.tiles = tiles
    room.started = true
  }),
  giri: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })

    const tsumo = room.state[me].hand.tsumo
    if (!tsumo) throw new TRPCError({ code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Tsumo not found' })

    if (index === -1) {
      room.state[me].river.push({
        tile: tsumo,
        isTsumogiri: true,
        isRiichi: false,
      })
    } else {
      room.state[me].river.push({
        tile: room.state[me].hand.closed.splice(index, 1)[0],
        isTsumogiri: false,
        isRiichi: false,
      })
      room.state[me].hand.closed.push(tsumo)
    }
    room.state[me].hand.tsumo = undefined

    const opponent = room.host === username ? 'guest' : 'host'
    room.state[opponent].hand.tsumo = room.state.wall.tiles.splice(0, 1)[0]
    room.state.turn = opponent
  }),
})
