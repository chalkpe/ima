import { codeToTile } from './code'
import { calculateAgari } from './agari'
import { getMachiTiles, isEqualTile, isMachi } from './tile'
import type { RiverTile } from '../types/game'
import type { TenpaiState } from '../types/agari'
import type { Tile } from '../types/tile'
import type { Tenpai } from '../types/tenpai'

export const calculateFuriten = (state: TenpaiState, river: RiverTile[], giriTile: Tile | null): boolean => {
  const machi = state.filter(isMachi)
  if (!machi.length) return false

  const machiTiles = machi.flatMap(getMachiTiles)
  if (!machiTiles.length) return false

  return machiTiles.every(
    (tile) => !river.some((r) => isEqualTile(r.tile, tile)) && (giriTile === null || !isEqualTile(giriTile, tile))
  )
}

export const calculateTenpai = (hand: Tile[], river: RiverTile[], giriTile: Tile | null): Tenpai[] | undefined => {
  const result = calculateAgari(hand)
  if (result.status !== 'tenpai') return

  const tenpai: Tenpai[] = [...result.tenpai.entries()].map(([code, states]) => ({
    giriTile,
    agariTile: codeToTile(code),
    status: states.every((state) => calculateFuriten(state, river, giriTile)) ? 'tenpai' : 'furiten',
  }))

  return tenpai.some((t) => t.status === 'furiten') ? tenpai.map((t) => ({ ...t, status: 'furiten' })) : tenpai
}
