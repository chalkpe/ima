import { TRPCError } from '@trpc/server'
import { isEqualTile, isSyuntsu } from '@ima/server/helpers/tile'
import type { Tile, Tsu } from '@ima/server/types/tile'
import type {
  GameState,
  Hand,
  Player,
  PlayerType,
  RiverTile,
  Room,
  StateChangeType,
  TileSet,
  Wall,
  Wind,
} from '@ima/server/types/game'

export const createInitialState = (): GameState => ({
  rule: {
    localYaku: false,
    manganShibari: true,
    length: 'east',
    transparentMode: false,
  },
  host: {
    wind: 'east',
    river: [],
    hand: {
      closed: [],
      called: [],
      tsumo: undefined,
      tenpai: [],
      banned: [],
    },
    decisions: [],
    jun: 0,
    riichi: null,
    score: 0,
  },
  guest: {
    wind: 'west',
    river: [],
    hand: {
      closed: [],
      called: [],
      tsumo: undefined,
      tenpai: [],
      banned: [],
    },
    decisions: [],
    jun: 0,
    riichi: null,
    score: 0,
  },
  wall: {
    tiles: [],
    firstTileIndex: 0,
    lastTileIndex: 0,
    kingTiles: [],
    firstKingTileIndex: 0,
    lastKingTileIndex: 0,
    supplementTiles: [],
    doraCount: 1,
  },
  turn: 'host',
  round: {
    wind: 'east',
    kyoku: 1,
    honba: 0,
    riichiSticks: 0,
  },
})

export const getOpponent = (me: PlayerType): PlayerType => (me === 'host' ? 'guest' : 'host')

export const getClosedHand = (hand: Hand) => {
  return hand.tsumo ? [...hand.closed, hand.tsumo] : [...hand.closed]
}

export const getRiverEnd = (player: Player): RiverTile | undefined => {
  const river = player.river
  return river.length > 0 ? river[river.length - 1] : undefined
}

export const getActiveMe = (room: Room, id: string) => {
  const me = room.host === id ? 'host' : 'guest'
  if (room.state.scoreboard) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Game ended' })
  if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })
  return me
}

export const haipaiCounts = [4, 4, 4, 1] as const

const getTileAttribute = (count: number, value: number): Tile['attribute'] =>
  count === 1 && value === 5 ? 'red' : 'normal'

const getTileBackground = (state: GameState, count: number): Tile['background'] => {
  if (!state.rule.transparentMode) return 'white'
  return count === 1 ? 'white' : 'transparent'
}

export const getAvailableTiles = (state: GameState): Tile[] =>
  [1, 2, 3, 4].flatMap((count) =>
    [
      [1, 9].flatMap((value) => [
        {
          type: 'man',
          value,
          attribute: getTileAttribute(count, value),
          background: getTileBackground(state, count),
          index: -1,
        } as const,
      ]),
      [1, 9].flatMap((value) => [
        {
          type: 'pin',
          value,
          attribute: getTileAttribute(count, value),
          background: getTileBackground(state, count),
          index: -1,
        } as const,
      ]),
      [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((value) => [
        {
          type: 'sou',
          value,
          attribute: getTileAttribute(count, value),
          background: getTileBackground(state, count),
          index: -1,
        } as const,
      ]),
      [1, 2, 3, 4].flatMap((value) => [
        {
          type: 'wind',
          value,
          attribute: 'normal',
          background: getTileBackground(state, count),
          index: -1,
        } as const,
      ]),
      [1, 2, 3].flatMap((value) => [
        {
          type: 'dragon',
          value,
          attribute: 'normal',
          background: getTileBackground(state, count),
          index: -1,
        } as const,
      ]),
    ].flat()
  )

export const isMenzenHand = (hand: Hand) => hand.called.filter((s) => s.type !== 'ankan').length === 0

export const doraIndices = [4, 6, 8, 10, 12]
export const uraDoraIndices = [5, 7, 9, 11, 13]

export const getDoraTiles = (wall: Wall): Tile[] =>
  wall.kingTiles.filter((tile) => doraIndices.slice(0, wall.doraCount).includes(tile.index - wall.firstKingTileIndex))

export const getUraDoraTiles = (wall: Wall): Tile[] =>
  wall.kingTiles.filter((tile) =>
    uraDoraIndices.slice(0, wall.doraCount).includes(tile.index - wall.firstKingTileIndex)
  )

export const tileSetToTsu = (s: TileSet): Tsu => {
  switch (s.type) {
    case 'ankan':
      return { type: 'kantsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2], s.tiles[3]], open: false, furo: false }
    case 'gakan':
    case 'daiminkan':
      return { type: 'kantsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2], s.tiles[3]], open: true, furo: true }
    case 'chi':
      return { type: 'shuntsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2]], open: true, furo: true }
    case 'pon':
      return { type: 'koutsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2]], open: true, furo: true }
  }
}

export const getNextWind = (state: GameState, wind: Wind): Wind | undefined => {
  switch (state.rule.length) {
    case 'east':
      return undefined

    case 'south':
      switch (wind) {
        case 'east':
          return 'south'
        case 'south':
        case 'west':
        case 'north':
        default:
          return undefined
      }

    case 'north':
      switch (wind) {
        case 'east':
          return 'south'
        case 'south':
          return 'west'
        case 'west':
          return 'north'
        case 'north':
          return undefined
      }
  }
}

export const isRinshanTile = (state: GameState, tile: Tile) =>
  tile.index >= state.wall.firstKingTileIndex && tile.index <= state.wall.lastKingTileIndex

export const isKuikae = (state: GameState, me: PlayerType, tile: Tile) => {
  const call = state[me].hand.called[state[me].hand.called.length - 1]
  if (!call) return false

  const opponentJun = state[getOpponent(me)].jun
  if (call.jun !== opponentJun) return false

  const { calledTile } = call
  if (!calledTile) return false

  switch (call.type) {
    case 'pon': {
      return isEqualTile(calledTile, tile)
    }
    case 'chi': {
      if (isEqualTile(calledTile, tile)) return true
      const tatsu = call.tiles.filter((t) => !isEqualTile(t, calledTile))
      return tatsu.length === 2 && isSyuntsu([tatsu[0], tatsu[1], tile])
    }
    default:
      return false
  }
}

export const stateChangeTypes = [
  'update',
  'start',
  'stop',
  'end',
  'tsumo',
  'ron',
  'riichi',
  'nuki',
  'kan',
  'pon',
  'chi',
] as const satisfies StateChangeType[]
