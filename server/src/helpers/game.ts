import type { Tile } from '../types/tile'
import type { Hand, Player, PlayerType, RiverTile, Room } from '../types/game'
import { TRPCError } from '@trpc/server'

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