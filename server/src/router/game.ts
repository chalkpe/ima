import z from 'zod'
import { TRPCError } from '@trpc/server'
import { availableTiles, database, Decision, GameState, Hand, Player, Room, Tile, tileTypes } from '../db'
import { publicProcedure, router } from '../trpc'

const getRoom = (username: string) => {
  const room = database.rooms.find((room) => room.host === username || room.guest === username)
  if (!room) throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
  return room
}

const getClosedHand = (hand: Hand) => {
  return hand.tsumo ? [...hand.closed, hand.tsumo] : [...hand.closed]
}

type SimpleTile = Pick<Tile, 'type' | 'value'>

function removeTiles(tiles: Tile[], tile: SimpleTile, count: number) {
  return tiles.reduce(
    (result, current) => {
      if (current.type === tile.type && current.value === tile.value && result.removed.length < count) {
        result.removed.push(current)
      } else {
        result.remain.push(current)
      }
      return result
    },
    { remain: [] as Tile[], removed: [] as Tile[] }
  )
}

function getSequences(tile: Tile): SimpleTile[][] {
  const { type, value } = tile
  if (type === 'wind' || type === 'dragon' || type === 'back') return []

  if (value === 1)
    return [
      [
        { type, value: 2 },
        { type, value: 3 },
      ],
    ]
  if (value === 2)
    return [
      [
        { type, value: 1 },
        { type, value: 3 },
      ],
      [
        { type, value: 3 },
        { type, value: 4 },
      ],
    ]
  if (value === 8)
    return [
      [
        { type, value: 6 },
        { type, value: 7 },
      ],
      [
        { type, value: 7 },
        { type, value: 9 },
      ],
    ]
  if (value === 9)
    return [
      [
        { type, value: 7 },
        { type, value: 8 },
      ],
    ]
  return [
    [
      { type, value: value - 2 },
      { type, value: value - 1 },
    ],
    [
      { type, value: value - 1 },
      { type, value: value + 1 },
    ],
    [
      { type, value: value + 1 },
      { type, value: value + 2 },
    ],
  ]
}

const code: Record<Tile['type'], string> = {
  man: 'm',
  pin: 'p',
  sou: 's',
  wind: 'w',
  dragon: 'd',
  back: 'b',
}

const backTile: Tile = { type: 'back', value: 0, attribute: 'normal', background: 'white', index: 0 }

function toString(groups: Tile[][]) {
  return groups
    .map((group) => group.map((tile) => tile.value + code[tile.type]).join(''))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .join(',')
}

interface Result {
  finished?: boolean
  groups: Tile[][]
  possibilities: Set<string>
}

export function check(tiles: Tile[], result: Result = { groups: [], possibilities: new Set() }): Result | false {
  if (tiles.length === 0) return { ...result, finished: true }
  if (tiles.length === 1) return false
  if (tiles.length === 2)
    return tiles[0] === tiles[1] ? { ...result, groups: [...result.groups, tiles], finished: true } : false

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i]

    const { removed, remain } = removeTiles(tiles, tile, 3)
    if (removed.length === 3) {
      const r = check(remain, { ...result, groups: [...result.groups, removed] })
      if (r && r.finished) result.possibilities.add(toString(r.groups))
    }

    if (result.groups.every((group) => group.length !== 2) && removed.length === 2) {
      const r = check(remain, { ...result, groups: [...result.groups, removed] })
      if (r && r.finished) result.possibilities.add(toString(r.groups))
    }

    for (const sequence of getSequences(tile)) {
      const [first, second] = sequence
      const { removed, remain } = removeTiles(tiles, first, 1)
      if (removed.length === 1) {
        const { removed: removed2, remain: remain2 } = removeTiles(remain, second, 1)
        if (removed2.length === 1) {
          const { removed: removed3, remain: remain3 } = removeTiles(remain2, tile, 1)
          if (removed3.length === 1) {
            const r = check(remain3, {
              ...result,
              groups: [...result.groups, [...removed, ...removed2, ...removed3].sort((a, b) => a.value - b.value)],
            })
            if (r && r.finished) result.possibilities.add(toString(r.groups))
          }
        }
      }
    }
  }

  return result.possibilities.size ? result : false
}

// console.log(
//   check([
//     { type: 'sou', value: 1 } as Tile,
//     { type: 'sou', value: 2 } as Tile,
//     { type: 'sou', value: 3 } as Tile,
//     { type: 'sou', value: 4 } as Tile,
//     { type: 'sou', value: 5 } as Tile,
//     { type: 'sou', value: 6 } as Tile,
//     { type: 'sou', value: 7 } as Tile,
//     { type: 'sou', value: 7 } as Tile,
//   ])
// )

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

  const result = check(hand)
  return result ? ([{ type: 'tsumo', tile: player.hand.tsumo, otherTiles: [] }] satisfies Decision[]) : []
}

const calculateRonDecisions = (player: Player, opponent: Player) => {
  if (opponent.river.length === 0) return []
  const ronTile = opponent.river[opponent.river.length - 1].tile
  const hand = [...player.hand.closed, ronTile]

  const result = check(hand)
  return result ? ([{ type: 'ron', tile: ronTile, otherTiles: [] }] satisfies Decision[]) : []
}

const calculatePonKanDecisions = (player: Player, opponent: Player) => {
  if (opponent.river.length === 0) return []
  const furoTile = opponent.river[opponent.river.length - 1].tile

  const { removed } = removeTiles(player.hand.closed, furoTile, 3)
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
          },
          decisions: [],
        },
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
    room.state.host.decisions = calculateAfterTsumoDecisions(room, room.host)

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
    const { remain, removed } = removeTiles(room.state[me].hand.closed, furoTile, 2)
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

    room.state[me].decisions = calculateAfterTsumoDecisions(room, username)
  }),

  skipAndTsumo: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx

    const room = getRoom(username)
    if (!room.started) throw new TRPCError({ code: 'FORBIDDEN', message: 'Game not started' })

    const me = room.host === username ? 'host' : 'guest'
    if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })
    if (room.state[me].decisions.length === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions empty' })

    room.state[me].hand.tsumo = room.state.wall.tiles.splice(0, 1)[0]
    room.state[me].decisions = calculateAfterTsumoDecisions(room, username)
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

    const opponent = room.host === username ? 'guest' : 'host'
    room.state.turn = opponent

    room.state[me].decisions = []
    room.state[opponent].decisions = calculateBeforeTsumoDecisions(room, room[opponent])

    if (room.state[opponent].decisions.length === 0) {
      room.state[opponent].hand.tsumo = room.state.wall.tiles.splice(0, 1)[0]
      room.state[opponent].decisions = calculateAfterTsumoDecisions(room, room[opponent])
    }
  }),
})
