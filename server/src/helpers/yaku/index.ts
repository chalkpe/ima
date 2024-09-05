import { calculateAgari } from '@ima/server/helpers/agari'
import { getDoraTiles, getOpponent, getUraDoraTiles, tileSetToTsu } from '@ima/server/helpers/game'
import yakuValidators from '@ima/server/helpers/yaku/validator'
import type { AgariState } from '@ima/server/types/agari'
import type { Tile } from '@ima/server/types/tile'
import type { GameState, Hand, PlayerType } from '@ima/server/types/game'
import type { AgariType, Yaku, YakuPredicateParams } from '@ima/server/types/yaku'

const calculateYakuOfAgari = (
  state: GameState,
  me: PlayerType,
  agariType: AgariType,
  agariTile: Tile,
  agariState: AgariState
): Yaku[] => {
  const menzen = agariState.every((tsu) => !tsu.open)

  const agariTsu = agariState.find((tsu) => tsu.tiles.some((tile) => tile.index === agariTile.index))
  /* istanbul ignore next */ if (!agariTsu) return []

  if (agariType === 'ron') {
    agariTsu.open = true
  }

  const opponent = getOpponent(me)
  const params: YakuPredicateParams = {
    agariType,
    agariTile,
    agariState,
    agariTsu,
    jun: state[me].jun,
    bakaze: state.round.wind,
    jikaze: state[me].wind,
    menzen,
    riichi: state[me].riichi,
    doraTiles: getDoraTiles(state.wall),
    uraDoraTiles: getUraDoraTiles(state.wall),
    called: {
      me: state[me].hand.called.length > 0 ? state[me].hand.called[state[me].hand.called.length - 1] : undefined,
      opponent:
        state[opponent].hand.called.length > 0
          ? state[opponent].hand.called[state[opponent].hand.called.length - 1]
          : undefined,
    },
  }

  const result: Yaku[] = []
  let validators = [...yakuValidators]

  while (validators.length > 0) {
    const yaku = validators.splice(0, 1)[0].predicate(params)
    if (!yaku) continue

    const r = Array.isArray(yaku) ? yaku : [yaku]
    result.push(...r)

    if (r.some((y) => y.isYakuman)) validators = validators.filter((v) => v.level === 'yakuman')
  }

  if (!result.some((yaku) => yaku.isYakuman)) return result
  return result.filter((yaku) => yaku.isYakuman)
}

export const calculateYaku = (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  agariType: AgariType,
  agariTile: Tile
): Yaku[] => {
  const result = calculateAgari([...hand.closed, agariTile], {
    status: 'noten',
    state: hand.called.map(tileSetToTsu),
    agari: [],
    tenpai: new Map(),
  })

  if (result.status !== 'agari') return []

  const agariList = result.agari
    .map((agariState) => calculateYakuOfAgari(state, me, agariType, agariTile, agariState))
    .sort((a, b) => b.reduce((res, yaku) => res + yaku.han, 0) - a.reduce((res, yaku) => res + yaku.han, 0))

  return agariList[0]
}
