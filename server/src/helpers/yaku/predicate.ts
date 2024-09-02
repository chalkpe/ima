import { partition } from '../common'
import { tileToCode } from '../code'
import { getTatsuMachi, getTileWind, isEqualTile, isStrictEqualTile, isYakuhai, isYaochuuhai, tileNames } from '../tile'
import type { YakuPredicate } from '../../types/yaku'

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

const isDora: YakuPredicate = ({ agariState, doraTiles }) => {
  const count = agariState.map((tsu) => tsu.tiles.filter((tile) => doraTiles.some((dora) => isEqualTile(tile, dora))).length)
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
    .map((tsu) => tsu.tiles.filter((tile) => uraDoraTiles.some((dora) => isEqualTile(tile, dora))).length)
    .reduce((a, b) => a + b)

  return count > 0 ? { name: '뒷도라', han: count } : false
}

const yakuPredicates: YakuPredicate[] = [
  isMenzenTsumo,
  isRiichi,
  isChiitoitsu,
  isPinfu,
  isYakuhaiKoutsu,
  isTanyao,
  isToitoi,
  isItsu,
  isDora,
  isAkaDora,
  isUraDora,
]

export default yakuPredicates
