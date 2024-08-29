import z from 'zod'
import { TRPCError } from '@trpc/server'
import { availableTiles, database, Decision, GameState, Hand, Player, Room, SimpleTile, Tile, tileTypes } from '../db'
import { publicProcedure, router } from '../trpc'
import { calculateAgari, codeToTile, removeTileFromHand } from '../helpers/agari'

const getRoom = (username: string) => {
  const room = database.rooms.find((room) => room.host === username || room.guest === username)
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  return room
}

const getClosedHand = (hand: Hand) => {
  return hand.tsumo ? [...hand.closed, hand.tsumo] : [...hand.closed]
}

const backTile: Tile = { type: 'back', value: 0, attribute: 'normal', background: 'white', index: 0 }

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

const calculateTsumoDecisions = (player: Player) => {
  if (player.hand.tsumo === undefined) return []
  const hand = getClosedHand(player.hand)

  const result = calculateAgari(hand)
  return result.status === 'agari' ? ([{ type: 'tsumo', tile: player.hand.tsumo, otherTiles: [] }] satisfies Decision[]) : []
}

const calculateRonDecisions = (player: Player, opponent: Player) => {
  if (opponent.river.length === 0) return []
  const ronTile = opponent.river[opponent.river.length - 1].tile
  const hand = [...player.hand.closed, ronTile]

  const result = calculateAgari(hand)
  return result.status === 'agari' ? ([{ type: 'ron', tile: ronTile, otherTiles: [] }] satisfies Decision[]) : []
}

const calculatePonKanDecisions = (player: Player, opponent: Player) => {
  if (opponent.river.length === 0) return []
  const furoTile = opponent.river[opponent.river.length - 1].tile

  const [_, removed] = removeTileFromHand(player.hand.closed, furoTile, 3)
  if (removed.length === 3)
    return [
      { type: 'kan', tile: furoTile, otherTiles: removed },
      { type: 'pon', tile: furoTile, otherTiles: removed },
    ] satisfies Decision[]

  if (removed.length === 2) return [{ type: 'pon', tile: furoTile, otherTiles: removed }] satisfies Decision[]

  return []
}

const calculateBeforeTsumoDecisions = (room: Room, username: string) => {
  const me = room.host === username ? 'host' : 'guest'
  const opponent = room.host === username ? 'guest' : 'host'
  const decisions = [
    ...calculateRonDecisions(room.state[me], room.state[opponent]),
    ...calculatePonKanDecisions(room.state[me], room.state[opponent]),
  ]

  return decisions.length > 0
    ? ([...decisions, { type: 'skip', tile: backTile, otherTiles: [] }] satisfies Decision[])
    : []
}

const calculateAfterTsumoDecisions = (room: Room, username: string) => {
  const me = room.host === username ? 'host' : 'guest'
  return [...calculateAnkanDecisions(room.state[me]), ...calculateTsumoDecisions(room.state[me])]
}

const onAfterTsumo = (room: Room, username: string) => {
  const me = room.host === username ? 'host' : 'guest'

  room.state[me].decisions = calculateAfterTsumoDecisions(room, username)
  room.state[me].hand.tenpai = [
    ...room.state[me].hand.closed.map((_, index, array) => {
      const hand = array.filter((_, i) => i !== index)
      return room.state[me].hand.tsumo ? [...hand, room.state[me].hand.tsumo] : hand
    }),
    room.state[me].hand.closed,
  ].map((hand) => {
    const result = calculateAgari(hand)
    return result.status === 'tenpai' ? [...result.tenpai.keys()].map(codeToTile) : []
  })
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
            tenpai: [],
          },
          decisions: [],
        } satisfies Player,
        wall: {
          ...room.state.wall,
          tiles: room.state.wall.tiles.map((tile) => ({ ...backTile, index: tile.index })),
          kingTiles: room.state.wall.kingTiles.map((tile, index) =>
            [9, 7, 5, 3, 1].slice(0, room.state.wall.doraCount).includes(index) ? tile : backTile
          ),
          supplementTiles: room.state.wall.supplementTiles.map(() => backTile),
        },
      } satisfies GameState,
    }
  }),
  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)
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

    room.state.wall.tilesCount = tiles.length
    tiles.forEach((tile, index) => (tile.index = index))

    room.state.host.hand.tsumo = tiles.splice(0, 1)[0]
    room.state.wall.tiles = tiles

    room.state.turn = 'host'
    onAfterTsumo(room, room.host)

    room.started = true
  }),

  pon: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })

    const opponent = room.host === username ? 'guest' : 'host'
    if (room.state[opponent].river.length === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'River empty' })

    const furoTile = room.state[opponent].river[room.state[opponent].river.length - 1].tile
    const [remain, removed] = removeTileFromHand(room.state[me].hand.closed, furoTile, 2)
    if (removed.length !== 2) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

    room.state[me].hand.closed = remain
    room.state[me].hand.called.push({ type: 'pon', tiles: [furoTile, ...removed], calledTile: furoTile })

    room.state[me].decisions = []
    room.state[me].isAfterCall = true
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

    onAfterTsumo(room, username)
  }),

  skipAndTsumo: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })
    if (room.state[me].decisions.length === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions empty' })

    room.state[me].hand.tsumo = room.state.wall.tiles.splice(0, 1)[0]
    onAfterTsumo(room, username)
  }),

  giri: publicProcedure.input(z.object({ index: z.number() })).mutation((opts) => {
    const { username } = opts.ctx
    const { index } = opts.input

    const room = getRoom(username)
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })

    const tsumo = room.state[me].hand.tsumo

    const canGiri = tsumo || room.state[me].isAfterCall
    if (!canGiri) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot giri now' })

    if (index === -1) {
      if (!tsumo) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tsumo not found' })
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
      if (tsumo) room.state[me].hand.closed.push(tsumo)
    }

    room.state[me].isAfterCall = false
    room.state[me].hand.tsumo = undefined
    room.state[me].hand.tenpai = []

    const opponent = room.host === username ? 'guest' : 'host'
    room.state.turn = opponent

    room.state[me].decisions = []
    room.state[opponent].decisions = calculateBeforeTsumoDecisions(room, room[opponent])

    if (room.state[opponent].decisions.length === 0) {
      room.state[opponent].hand.tsumo = room.state.wall.tiles.splice(0, 1)[0]
      onAfterTsumo(room, room[opponent])
    }
  }),
})
