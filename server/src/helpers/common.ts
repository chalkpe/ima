import type { Hand, Player, PlayerType, RiverTile, SimpleTile } from '../db'
import { Code, codeSyntaxToHand, tileToCode } from './code'

export const getOpponent = (me: PlayerType): PlayerType => (me === 'host' ? 'guest' : 'host')

export const getClosedHand = (hand: Hand) => {
  return hand.tsumo ? [...hand.closed, hand.tsumo] : [...hand.closed]
}

export const getRiverEnd = (player: Player): RiverTile | undefined => {
  const river = player.river
  return river.length > 0 ? river[river.length - 1] : undefined
}

export const countTiles = (hand: SimpleTile[]): Record<Code, number> =>
  hand.map(tileToCode).reduce((r, code) => ({ ...r, [code]: (r[code] || 0) + 1 }), {} as Record<Code, number>)

export const isEqualTile = (a: SimpleTile, b: SimpleTile): boolean => a.type === b.type && a.value === b.value

export const removeTileFromHand = <T extends SimpleTile>(hand: T[], target: T, count: number): [T[], T[]] => {
  return hand.reduce(
    (res, t) => (isEqualTile(t, target) && res[1].length < count ? [res[0], [...res[1], t]] : [[...res[0], t], res[1]]),
    [[], []] as [T[], T[]]
  )
}

export const partition = <T>(arr: T[], predicate: (t: T) => boolean) => [
  arr.filter(predicate),
  arr.filter((t) => !predicate(t)),
]

export const kokushiTiles = codeSyntaxToHand('19m19p19s1234567z')