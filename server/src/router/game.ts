import z from 'zod'
import { TRPCError } from '@trpc/server'
import { availableTiles, database, Decision, GameState, Hand, Player, Tile, tileTypes } from '../db'
import { publicProcedure, router } from '../trpc'

const getRoom = (username: string) => {
  const room = database.rooms.find((room) => room.host === username || room.guest === username)
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  return room
}

const getClosedHand = (hand: Hand) => {
  return hand.tsumo ? [...hand.closed, hand.tsumo] : [...hand.closed]
}

const calculateAnkanDecisions = (player: Player) => {
  const closedHand = getClosedHand(player.hand)
  
  const tileCounts = closedHand.reduce((acc, tile) => {
    const key = `${tile.type}-${tile.value}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const ankanDecisions: Decision[] = Object.entries(tileCounts)
    .filter(([_, count]) => count === 4)
    .map(([key, count]) => closedHand.filter((tile) => `${tile.type}-${tile.value}` === key))
    .map(([tile, ...otherTiles]) => ({ type: 'kan', tile, otherTiles }))

  return ankanDecisions
}

const calculateDecisions = (player: Player) => {
  return [
    ...calculateAnkanDecisions(player),
  ]
}

const partition = <T>(arr: T[], predicate: (t: T) => boolean) => [
  arr.filter(predicate),
  arr.filter((t) => !predicate(t)),
]

export const gameRouter = router({
  state: publicProcedure.query((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)
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
          tiles: room.state.wall.tiles, //.map(() => backTile),
          kingTiles: room.state.wall.kingTiles.map((tile, index) =>
            [9, 7, 5, 3, 1].slice(0, room.state.wall.doraCount).includes(index) ? tile : backTile
          ),
        },
      } satisfies GameState,
    }
  }),
  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)
    if (room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game already started' })

    // const tiles = availableTiles.slice()
    const tiles = availableTiles.slice().filter((tile) => tile.type !== 'wind')
    for (let i = tiles.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[rand]] = [tiles[rand], tiles[i]]
    }

    room.state.wall.kingTiles = tiles.splice(0, 14)
    room.state.wall.supplementTiles = []

    // room.state.host.hand.closed = []
    room.state.host.hand.closed = [
      ...availableTiles.filter((tile) => tile.type === 'wind' && tile.value === 1),
      ...availableTiles.filter((tile) => tile.type === 'wind' && tile.value === 2)
    ]
    // room.state.guest.hand.closed = []
    room.state.guest.hand.closed = [
      ...availableTiles.filter((tile) => tile.type === 'wind' && tile.value === 3),
      ...availableTiles.filter((tile) => tile.type === 'wind' && tile.value === 4)
    ]
    // ;[4, 4, 4, 1].forEach((count) => {
    ;[4, 1].forEach((count) => {
      room.state.host.hand.closed.push(...tiles.splice(0, count))
      room.state.guest.hand.closed.push(...tiles.splice(0, count))
    })

    room.state.wall.tilesCount = tiles.length
    tiles.forEach((tile, index) => (tile.index = index))

    room.state.host.hand.tsumo = tiles.splice(0, 1)[0]
    room.state.wall.tiles = tiles

    room.state.turn = 'host'
    room.state.host.decisions = calculateDecisions(room.state.host)

    room.started = true
  }),

  ankan: publicProcedure.input(z.object({ type: z.enum(tileTypes), value: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { type, value } = opts.input

    const room = getRoom(username)
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })

    const closedHand = getClosedHand(room.state[me].hand)
    const [ankanTiles, otherTiles] = partition(closedHand, (tile) => tile.type === type && tile.value === value)
    if (ankanTiles.length !== 4) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

    room.state[me].hand.closed = otherTiles
    room.state[me].hand.called.push({ type: 'ankan', tiles: ankanTiles })

    room.state[me].hand.tsumo = room.state.wall.kingTiles.splice(-1, 1)[0]
    room.state.wall.supplementTiles.push(room.state.wall.tiles.splice(-1, 1)[0])
    room.state.wall.doraCount += 1

    room.state[me].decisions = calculateDecisions(room.state[me])
  }),

  giri: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username)
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })

    const tsumo = room.state[me].hand.tsumo
    if (!tsumo) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tsumo not found' })

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

    room.state[me].decisions = []
    room.state[opponent].decisions = calculateDecisions(room.state[opponent])
    room.state.turn = opponent
  }),
})
