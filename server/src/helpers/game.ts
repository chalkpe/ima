import { TRPCError } from '@trpc/server'
import type { Tile } from '../types/tile'
import type { GameState, Hand, Player, PlayerType, RiverTile, Room, Wall } from '../types/game'

export const createInitialState = (): GameState => ({
  host: {
    wind: 'east',
    river: [],
    hand: {
      closed: [],
      called: [],
      tsumo: undefined,
      tenpai: [],
      giriMap: [],
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
      giriMap: [],
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

export const getActiveMe = (room: Room, username: string) => {
  const me = room.host === username ? 'host' : 'guest'
  if (room.state.scoreboard) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Game ended' })
  if (room.state.turn !== me) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your turn' })
  return me
}

export const haipaiCounts = [4, 4, 4, 1] as const

const getDefaultAttribute = (count: number, value: number) => (count === 1 && value === 5 ? 'red' : 'normal')

export const availableTiles: Tile[] = [1, 2, 3, 4].flatMap((count) =>
  [
    [1, 9].flatMap((value) => [
      { type: 'man', value, attribute: getDefaultAttribute(count, value), background: 'white', index: -1 } as const,
    ]),
    [1, 9].flatMap((value) => [
      { type: 'pin', value, attribute: getDefaultAttribute(count, value), background: 'white', index: -1 } as const,
    ]),
    [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((value) => [
      { type: 'sou', value, attribute: getDefaultAttribute(count, value), background: 'white', index: -1 } as const,
    ]),
    [1, 2, 3, 4].flatMap(
      (value) => [{ type: 'wind', value, attribute: 'normal', background: 'white', index: -1 }] as const
    ),
    [1, 2, 3].flatMap(
      (value) => [{ type: 'dragon', value, attribute: 'normal', background: 'white', index: -1 }] as const
    ),
  ].flat()
)

export const isMenzenHand = (hand: Hand) => hand.called.filter((s) => s.type !== 'ankan').length === 0

export const doraIndices = [9, 7, 5, 3, 1]
export const uraDoraIndices = [8, 6, 4, 2, 0]

export const getDoraTiles = (wall: Wall): Tile[] =>
  wall.kingTiles.filter((_, index) => doraIndices.slice(0, wall.doraCount).includes(index))

export const getUraDoraTiles = (wall: Wall): Tile[] =>
  wall.kingTiles.filter((_, index) => uraDoraIndices.slice(0, wall.doraCount).includes(index))