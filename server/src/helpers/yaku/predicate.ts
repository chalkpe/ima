import { partition } from '../common'
import { tileToCode } from '../code'
import {
  compareTile,
  getDoraTile,
  getTatsuMachi,
  getTileWind,
  isEqualTile,
  isStrictEqualTile,
  isYakuhai,
  isYaochuuhai,
  tileNames,
} from '../tile'
import type { YakuPredicate } from '../../types/yaku'
import { availableTiles } from '../game'

const isKokushimusou: YakuPredicate = ({ agariState, agariTsu }) => {
  const [kokushi, toitsu] = partition(agariState, (tsu) => tsu.type === 'kokushi')

  if (kokushi.length !== 12 || toitsu.length !== 1 || toitsu[0].type !== 'toitsu') return false
  return agariTsu.type === 'kokushi'
    ? { name: '국사무쌍', han: 13, isYakuman: true }
    : { name: '국사무쌍 13면 대기', han: 26, isYakuman: true }
}

const isMenzenTsumo: YakuPredicate = ({ agariType, menzen }) =>
  agariType === 'tsumo' && menzen && { name: '멘젠쯔모', han: 1 }

const isRiichi: YakuPredicate = ({ riichi }) =>
  riichi !== null && (riichi === 1 ? { name: '더블리치', han: 2 } : { name: '리치', han: 1 })

const isChiitoitsu: YakuPredicate = ({ agariState, menzen }) =>
  menzen && agariState.length === 7 && agariState.every((tsu) => tsu.type === 'toitsu') && { name: '치또이쯔', han: 2 }

const isPinfu: YakuPredicate = ({ agariState, agariTsu, agariTile, menzen, bakaze, jikaze }) => {
  if (!menzen) return false
  if (agariTsu.type !== 'shuntsu') return false

  const [shuntsu, toitsu] = partition(agariState, (tsu) => tsu.type === 'shuntsu')
  if (shuntsu.length !== 4) return false
  if (toitsu.length !== 1 || toitsu[0].type !== 'toitsu' || isYakuhai(toitsu[0].tiles[0], bakaze, jikaze)) return false

  const tatsu = agariTsu.tiles.filter((tsu) => !isStrictEqualTile(tsu, agariTile))
  if (getTatsuMachi([tatsu[0], tatsu[1]])?.type !== 'ryanmen') return false

  return { name: '핑후', han: 1 }
}

const isYakuhaiKoutsu: YakuPredicate = ({ agariState, bakaze, jikaze }) => {
  const yakuhai = agariState.filter((tsu) => tsu.type === 'koutsu' && isYakuhai(tsu.tiles[0], bakaze, jikaze))
  return yakuhai.length > 0
    ? yakuhai.flatMap((tsu) => {
        const tileType = tsu.tiles[0].type
        const tileName = tileNames[tileToCode(tsu.tiles[0])]

        if (tileType === 'dragon') return [{ name: `역패: ${tileName}`, han: 1 }]
        return [
          ...(getTileWind(tsu.tiles[0]) === bakaze
            ? [{ name: `장풍: ${tileNames[tileToCode(tsu.tiles[0])]}`, han: 1 }]
            : []),
          ...(getTileWind(tsu.tiles[0]) === jikaze
            ? [{ name: `자풍: ${tileNames[tileToCode(tsu.tiles[0])]}`, han: 1 }]
            : []),
        ].flat()
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

const isItsu: YakuPredicate = ({ agariState, menzen }) => {
  const types = [...new Set(agariState.flatMap((tsu) => tsu.tiles.map((tile) => tile.type)))]
  const [syuupai, others] = partition(types, (type) => type === 'man' || type === 'pin' || type === 'sou')

  if (syuupai.length !== 1) return false
  return others.length === 0 ? { name: '청일색', han: menzen ? 6 : 5 } : { name: '혼일색', han: menzen ? 3 : 2 }
}

const isIipeikou: YakuPredicate = ({ agariState }) => {
  const syuntsuCounts = agariState
    .filter((tsu) => tsu.type === 'shuntsu')
    .map((tsu) => tsu.tiles.sort(compareTile).map(tileToCode).join(''))
    .reduce((map, code) => ({ ...map, [code]: (map[code] || 0) + 1 }), {} as Record<string, number>)

  const iipeikou = Object.values(syuntsuCounts).filter((count) => count === 2)
  if (iipeikou.length === 0) return false
  return iipeikou.length === 2 ? { name: '량페코', han: 3 } : { name: '이페코', han: 1 }
}

const isSanankou: YakuPredicate = ({ agariState, agariTsu }) => {
  const ankou = agariState.filter((tsu) => (tsu.type === 'koutsu' || tsu.type === 'kantsu') && !tsu.open)
  if (ankou.length === 4) {
    return agariTsu.type === 'toitsu'
      ? { name: '스안커단기', han: 26, isYakuman: true }
      : { name: '스안커', han: 13, isYakuman: true }
  }
  if (ankou.length === 3) {
    return { name: '산안커', han: 2 }
  }
  return false
}

const isDora: YakuPredicate = ({ agariState, doraTiles }) => {
  const count = agariState
    .map(
      (tsu) =>
        tsu.tiles.filter((tile) => doraTiles.some((dora) => isEqualTile(tile, getDoraTile(dora, availableTiles))))
          .length
    )
    .reduce((a, b) => a + b)

  return count > 0 ? { name: '도라', han: count } : false
}

const isAkaDora: YakuPredicate = ({ agariState }) => {
  const count = agariState
    .map((tsu) => tsu.tiles.filter((tile) => tile.attribute === 'red').length)
    .reduce((a, b) => a + b)

  return count > 0 ? { name: '적도라', han: count } : false
}

const isUraDora: YakuPredicate = ({ riichi, agariState, uraDoraTiles }) => {
  if (riichi === null) return false

  const count = agariState
    .map(
      (tsu) =>
        tsu.tiles.filter((tile) => uraDoraTiles.some((dora) => isEqualTile(tile, getDoraTile(dora, availableTiles))))
          .length
    )
    .reduce((a, b) => a + b)

  return count > 0 ? { name: '뒷도라', han: count } : false
}

const yakuPredicates: YakuPredicate[] = [
  isKokushimusou,
  isMenzenTsumo,
  isRiichi,
  isChiitoitsu,
  isPinfu,
  isYakuhaiKoutsu,
  isTanyao,
  isToitoi,
  isItsu,
  isIipeikou,
  isSanankou,
  isDora,
  isAkaDora,
  isUraDora,
]

export default yakuPredicates
