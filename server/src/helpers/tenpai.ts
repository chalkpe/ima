import { codeToTile } from './code'
import { calculateAgari } from './agari'
import { getMachiTiles, isEqualTile, isMachi, simpleTileToTile } from './tile'
import type { GameState, Hand, PlayerType, RiverTile } from '../types/game'
import type { TenpaiState } from '../types/agari'
import type { Tile } from '../types/tile'
import type { Tenpai } from '../types/tenpai'
import { calculateYaku } from './yaku'
import { getClosedHand } from './game'

export const calculateFuriten = (
  state: GameState,
  me: PlayerType,
  tenpai: TenpaiState,
  giriTile: Tile | null
): boolean => {
  const machi = tenpai.filter(isMachi)
  if (!machi.length) return false

  const machiTiles = machi.flatMap(getMachiTiles)
  if (!machiTiles.length) return false

  return machiTiles.every(
    (t) => !state[me].river.some((r) => isEqualTile(r.tile, t)) && (giriTile === null || !isEqualTile(giriTile, t))
  )
}

export const calculateTenpai = (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  giriTile: Tile | null
): Tenpai[] | undefined => {
  const result = calculateAgari(getClosedHand(hand))
  if (result.status !== 'tenpai') return

  const tenpai: Tenpai[] = [...result.tenpai.entries()].map(([code, states]) => ({
    giriTile,
    agariTile: codeToTile(code),
    status: calculateYaku(state, me, hand, 'test', simpleTileToTile(codeToTile(code))).every((yaku) => yaku.isExtra)
      ? 'muyaku'
      : states.every((s) => calculateFuriten(state, me, s,  giriTile))
      ? 'tenpai'
      : 'furiten',
  }))

  return tenpai.some((t) => t.status === 'furiten')
    ? tenpai.map((t) => ({ ...t, status: t.status === 'tenpai' ? 'furiten' : t.status }))
    : tenpai
}
