import { isYaochuuhai } from '@ima/server/helpers/tile'
import { calculateAgariThreaded } from '@ima/server/workers/agari'
import {
  getAvailableTiles,
  getDoraTiles,
  getOpponent,
  getUraDoraTiles,
  isRinshanTile,
  tileSetToTsu,
} from '@ima/server/helpers/game'
import yakuValidators from '@ima/server/helpers/yaku/validators'

import type { AgariResult, AgariState } from '@ima/server/types/agari'
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
  const agariTsu = agariState.find((tsu) => tsu.tiles.some((tile) => tile.index === agariTile.index))
  /* istanbul ignore next */ if (!agariTsu) return []

  if (agariType !== 'tsumo') agariTsu.open = true

  const opponent = getOpponent(me)
  const params: YakuPredicateParams = {
    agariType,
    agariTile,
    agariState,
    agariTsu,
    jun: state[me].jun,
    opponentJun: state[opponent].jun,
    bakaze: state.round.wind,
    jikaze: state[me].wind,
    menzen: agariState.every((tsu) => !tsu.furo),
    riichi: state[me].riichi,
    opponentRiichi: state[opponent].riichi,
    doraTiles: getDoraTiles(state.wall),
    uraDoraTiles: getUraDoraTiles(state.wall),
    called: {
      me: state[me].hand.called.length > 0 ? state[me].hand.called[state[me].hand.called.length - 1] : undefined,
      opponent:
        state[opponent].hand.called.length > 0
          ? state[opponent].hand.called[state[opponent].hand.called.length - 1]
          : undefined,
    },
    agariTileType:
      state.wall.tiles.length === 0
        ? agariType === 'tsumo'
          ? 'haitei'
          : agariType === 'ron'
            ? 'houtei'
            : 'normal'
        : agariType === 'tsumo' && isRinshanTile(state, agariTile)
          ? 'rinshan'
          : 'normal',
    availableTiles: getAvailableTiles(state),
  }

  const result: Yaku[] = []
  let validators = yakuValidators(state)

  while (validators.length > 0) {
    const yaku = validators.splice(0, 1)[0].predicate(params)
    if (!yaku) continue

    const r = Array.isArray(yaku) ? yaku : [yaku]
    result.push(...r)

    if (r.some((y) => y.isYakuman)) validators = validators.filter((v) => v.level === 'yakuman')
  }

  const invalidated = result.flatMap((yaku) => yaku.invalidates || [])
  const invalidator = (yaku: Yaku) => !invalidated.includes(yaku.name)

  if (!result.some((yaku) => yaku.isYakuman)) return result.filter(invalidator)
  return result.filter((yaku) => yaku.isYakuman).filter(invalidator)
}

const compareByHan = (a: Yaku[], b: Yaku[], filter: (yaku: Yaku) => boolean = () => true) =>
  b.filter(filter).reduce((han, yaku) => han + yaku.han, 0) - a.filter(filter).reduce((han, yaku) => han + yaku.han, 0)

export const calculateYaku = async (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  agariType: AgariType,
  agariTile: Tile
): Promise<Yaku[]> => {
  const result = await calculateAgariThreaded([...hand.closed, agariTile], {
    status: 'noten',
    state: hand.called.map(tileSetToTsu),
    agari: [],
    tenpai: {} as AgariResult['tenpai'],
  })

  if (result.status !== 'agari') return []

  const agariList = result.agari
    .map((agariState) => calculateYakuOfAgari(state, me, agariType, agariTile, agariState))
    .toSorted((a, b) => compareByHan(a, b, (y) => !!y.isYakuman) || compareByHan(a, b))

  return agariList[0]
}

export const isYakuOverShibari = (state: GameState, yaku: Yaku[]): boolean =>
  yaku.some((yaku) => !yaku.isExtra) &&
  yaku.filter((yaku) => !yaku.isHidden).reduce((han, yaku) => han + yaku.han, 0) >= (state.rule.manganShibari ? 4 : 1)

export const isNagashiMangan = (state: GameState, me: PlayerType): boolean =>
  state[me].river.every((r) => isYaochuuhai(r.tile)) &&
  state[getOpponent(me)].hand.called.filter((c) => c.type !== 'ankan').length === 0
