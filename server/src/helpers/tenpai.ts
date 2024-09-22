import { codeToTile } from '@ima/server/helpers/code'
import { calculateAgari } from '@ima/server/helpers/agari'
import { calculateYaku } from '@ima/server/helpers/yaku'
import { getClosedHand } from '@ima/server/helpers/game'
import { getMachiTiles, isEqualTile, isMachi, simpleTileToTile } from '@ima/server/helpers/tile'
import type { GameState, Hand, PlayerType } from '@ima/server/types/game'
import type { TenpaiState } from '@ima/server/types/agari'
import type { Tile } from '@ima/server/types/tile'
import type { Tenpai } from '@ima/server/types/tenpai'
import type { Yaku } from '@ima/server/types/yaku'

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

const sumVisibleYaku = (yaku: Yaku[]) => yaku.filter((yaku) => !yaku.isHidden).reduce((sum, yaku) => sum + yaku.han, 0)

export const calculateTenpai = (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  giriTile: Tile | null
): Tenpai[] | undefined => {
  const result = calculateAgari(getClosedHand(hand))
  if (result.status !== 'tenpai') return

  const tenpai: Tenpai[] = [...result.tenpai.entries()].map(([code, states]) => {
    const agariTile = simpleTileToTile(codeToTile(code))
    const yaku = calculateYaku(state, me, hand, 'test', agariTile)

    const status =
      !yaku.length || yaku.every((yaku) => yaku.isExtra)
        ? 'muyaku'
        : !states.every((s) => calculateFuriten(state, me, s, giriTile))
          ? 'furiten'
          : 'tenpai'

    const han =
      status !== 'tenpai'
        ? undefined
        : {
            tsumo: sumVisibleYaku(calculateYaku(state, me, hand, 'tsumo', agariTile)),
            ron: sumVisibleYaku(calculateYaku(state, me, hand, 'ron', agariTile)),
          }

    return {
      giriTile,
      agariTile: codeToTile(code),
      status,
      han,
    }
  })

  return tenpai.some((t) => t.status === 'furiten')
    ? tenpai.map((t) => ({ ...t, status: t.status === 'tenpai' ? 'furiten' : t.status }))
    : tenpai
}
