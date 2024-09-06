import { codeToTile } from '@ima/server/helpers/code'
import { calculateAgari } from '@ima/server/helpers/agari'
import { getMachiTiles, isEqualTile, isMachi, simpleTileToTile } from '@ima/server/helpers/tile'
import type { GameState, Hand, PlayerType } from '@ima/server/types/game'
import type { TenpaiState } from '@ima/server/types/agari'
import type { Tile } from '@ima/server/types/tile'
import type { Tenpai } from '@ima/server/types/tenpai'
import { calculateYaku } from '@ima/server/helpers/yaku'
import { getClosedHand } from '@ima/server/helpers/game'

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

  const tenpai: Tenpai[] = [...result.tenpai.entries()].map(([code, states]) => {
    const yaku = calculateYaku(state, me, hand, 'test', simpleTileToTile(codeToTile(code)))

    return {
      giriTile,
      agariTile: codeToTile(code),
      status:
        !yaku.length || yaku.every((yaku) => yaku.isExtra)
          ? 'muyaku'
          : !states.every((s) => calculateFuriten(state, me, s, giriTile))
            ? 'furiten'
            : 'tenpai',
      han: yaku.filter((yaku) => !yaku.isHidden).reduce((sum, yaku) => sum + yaku.han, 0),
    }
  })

  return tenpai.some((t) => t.status === 'furiten')
    ? tenpai.map((t) => ({ ...t, status: t.status === 'tenpai' ? 'furiten' : t.status }))
    : tenpai
}
