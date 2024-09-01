import { AgariState } from '../types/agari'
import type { GameState, Hand, PlayerType, TileSet } from '../types/game'
import { Tile, Tsu } from '../types/tile'
import type { AgariType, Yaku, YakuPredicate, YakuPredicateParams } from '../types/yaku'
import { calculateAgari } from './agari'
import { tileToCode } from './code'
import { partition } from './common'
import { isMenzenHand } from './game'
import { getTatsuMachi, getTileWind, isStrictEqualTile, isYakuhai, isYaochuuhai, tileNames } from './tile'

const isMenzenTsumo: YakuPredicate = ({ state, me, agariType }) =>
  agariType === 'tsumo' && isMenzenHand(state[me].hand) && { name: '멘젠쯔모', han: 1 }

const isRiichi: YakuPredicate = ({ state, me }) =>
  state[me].riichi !== null && (state[me].riichi === 1 ? { name: '더블리치', han: 2 } : { name: '리치', han: 1 })

const isChiitoitsu: YakuPredicate = ({ agariState }) =>
  agariState.length === 7 && agariState.every((tsu) => tsu.type === 'toitsu') && { name: '치또이쯔', han: 2 }

const isPinfu: YakuPredicate = ({ state, me, agariState, agariTsu, agariTile }) => {
  if (agariTsu.type !== 'shuntsu') return false

  const [shuntsu, toitsu] = partition(agariState, (tsu) => tsu.type === 'shuntsu')
  if (shuntsu.length !== 4) return false
  if (
    toitsu.length !== 1 ||
    toitsu[0].type !== 'toitsu' ||
    isYakuhai(toitsu[0].tiles[0], state.round.wind, state[me].wind)
  )
    return false

  const tatsu = agariTsu.tiles.filter((tsu) => !isStrictEqualTile(tsu, agariTile))
  if (getTatsuMachi([tatsu[0], tatsu[1]])?.type !== 'ryanmen') return false

  return { name: '핑후', han: 1 }
}

const isYakuhaiKoutsu: YakuPredicate = ({ state, me, agariState }) => {
  const yakuhai = agariState.filter(
    (tsu) => tsu.type === 'koutsu' && isYakuhai(tsu.tiles[0], state.round.wind, state[me].wind)
  )
  return yakuhai.length > 0
    ? yakuhai.flatMap((tsu) => {
        const tileType = tsu.tiles[0].type
        const tileName = tileNames[tileToCode(tsu.tiles[0])]

        if (tileType === 'dragon') return [{ name: `역패: ${tileName}`, han: 1 }]
        return [
          ...(getTileWind(tsu.tiles[0]) === state.round.wind
            ? [{ name: `장풍: ${tileNames[tileToCode(tsu.tiles[0])]}`, han: 1 }]
            : []),
          ...(getTileWind(tsu.tiles[0]) === state[me].wind
            ? [{ name: `자풍: ${tileNames[tileToCode(tsu.tiles[0])]}`, han: 1 }]
            : []),
        ]
      })
    : false
}

const isTanyao: YakuPredicate = ({ agariState }) =>
  agariState.every((tsu) => tsu.tiles.every((tile) => !isYaochuuhai(tile))) && { name: '탕야오', han: 1 }

const isToitoi: YakuPredicate = ({ agariState }) => {
  const [toitsu, others] = partition(agariState, (tsu) => tsu.type === 'toitsu')
  return (
    toitsu.length === 1 &&
    others.every((tsu) => tsu.type === 'koutsu' || tsu.type === 'kantsu') && { name: '또이또이', han: 2 }
  )
}

const isHonitsu: YakuPredicate = ({ state, me, agariState }) => {
  const types = [...new Set(agariState.flatMap((tsu) => tsu.tiles.map((tile) => tile.type)))]
  return (
    types.filter((type) => type === 'man' || type === 'pin' || type === 'sou').length === 1 && {
      name: '혼일색',
      han: isMenzenHand(state[me].hand) ? 3 : 2,
    }
  )
}

const yakuPredicates: YakuPredicate[] = [
  isMenzenTsumo,
  isRiichi,
  isChiitoitsu,
  isPinfu,
  isYakuhaiKoutsu,
  isTanyao,
  isToitoi,
  isHonitsu,
]

const calculateYakuOfAgari = (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  agariType: AgariType,
  agariTile: Tile,
  agariState: AgariState
): Yaku[] => {
  const agariTsu = agariState.find((tsu) => tsu.tiles.some((tile) => isStrictEqualTile(tile, agariTile)))
  if (!agariTsu) return []

  const params: YakuPredicateParams = { state, me, hand, agariType, agariTile, agariState, agariTsu }
  return yakuPredicates.map((predicate) => predicate(params)).filter((yaku): yaku is Yaku => yaku !== false)
}

const tileSetToTsu = (s: TileSet): Tsu => {
  switch (s.type) {
    case 'ankan':
    case 'daiminkan':
    case 'gakan':
      return { type: 'kantsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2], s.tiles[3]] }
    case 'chi':
      return { type: 'shuntsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2]] }
    case 'pon':
      return { type: 'koutsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2]] }
  }
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
    .map((agariState) => calculateYakuOfAgari(state, me, hand, agariType, agariTile, agariState))
    .sort((a, b) => b.reduce((res, yaku) => res + yaku.han, 0) - a.reduce((res, yaku) => res + yaku.han, 0))

  return agariList[0]
}
