import { isSyuntsu } from '@ima/server/helpers/tile'
import { calculateYaku } from '@ima/server/helpers/yaku'
import { createInitialState } from '@ima/server/helpers/game'
import { c } from '@ima/server/helpers/__utils__/tile'
import type { Syuntsu } from '@ima/server/types/tile'
import type { AgariType } from '@ima/server/types/yaku'
import type { GameState, TileSet } from '@ima/server/types/game'

export const calc = (
  closedhand: string,
  calledHands: string[],
  type: AgariType,
  stateUpdater?: (state: GameState) => unknown
) => {
  const agari = c(closedhand)

  const state = createInitialState()
  state.wall.tiles = c('1234567z')
  state.wall.firstTileIndex = state.wall.tiles[0].index
  state.wall.lastTileIndex = state.wall.tiles[state.wall.tiles.length - 1].index

  stateUpdater?.(state)

  state.host.hand.closed.push(...agari.slice(0, -1))
  state.host.hand.called.push(
    ...calledHands.map(c).map<TileSet>((hand) => {
      if (hand.length >= 4)
        return {
          type: hand.length > 4 ? 'ankan' : 'gakan',
          tiles: [hand[0], hand[1], hand[2], hand[3]],
          jun: state.host.jun,
        }
      if (hand.length === 3) {
        const tsu = [hand[0], hand[1], hand[2]] as Syuntsu
        return { type: isSyuntsu(tsu) ? 'chi' : 'pon', tiles: tsu, jun: state.host.jun }
      }

      /* istanbul ignore next */
      throw new Error('invalid hand')
    })
  )

  const agariTile = agari.slice(-1)[0] || state.host.hand.tsumo
  /* istanbul ignore next */ if (!agariTile) throw new Error('agari tile not found')

  return calculateYaku(state, 'host', state.host.hand, type, agariTile)
}
