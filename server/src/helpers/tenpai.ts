import { codeToTile } from '@ima/server/helpers/code'
import { calculateYaku } from '@ima/server/helpers/yaku'
import { getClosedHand } from '@ima/server/helpers/game'
import { getMachiTiles, isEqualTile, isMachi, simpleTileToTile } from '@ima/server/helpers/tile'
import { calculateAgariThreaded } from '@ima/server/workers/agari'

import type { GameState, Hand, PlayerType } from '@ima/server/types/game'
import type { TenpaiState } from '@ima/server/types/agari'
import type { Tile } from '@ima/server/types/tile'
import type { Tenpai } from '@ima/server/types/tenpai'
import type { Yaku } from '@ima/server/types/yaku'
import type { Code } from '@ima/server/types/code'

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

export const calculateTenpai = async (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  giriTile: Tile | null
): Promise<Tenpai[] | undefined> => {
  const result = await calculateAgariThreaded(getClosedHand(hand))
  if (result.status !== 'tenpai') return

  const tenpai: Tenpai[] = await Promise.all(
    Object.entries(result.tenpai).map(async ([code, states]) => {
      const agariTile = simpleTileToTile(codeToTile(code as Code))
      const yaku = await calculateYaku(state, me, hand, 'test', agariTile)

      const status =
        !yaku.length || yaku.every((yaku) => yaku.isExtra)
          ? 'muyaku'
          : !states.every((s) => calculateFuriten(state, me, s, giriTile))
            ? 'furiten'
            : 'tenpai'

      const han =
        status !== 'tenpai'
          ? undefined
          : await Promise.all([
              calculateYaku(state, me, hand, 'tsumo', agariTile),
              calculateYaku(state, me, hand, 'ron', agariTile),
            ]).then(([tsumo, ron]) => ({ tsumo: sumVisibleYaku(tsumo), ron: sumVisibleYaku(ron) }))

      return {
        giriTile,
        agariTile: codeToTile(code as Code),
        status,
        han,
      }
    })
  )

  return tenpai.some((t) => t.status === 'furiten')
    ? tenpai.map((t) => ({ ...t, status: t.status === 'tenpai' ? 'furiten' : t.status }))
    : tenpai
}
