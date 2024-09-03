import { partition } from '../common'
import { codeToTile, tileToCode } from '../code'
import {
  compareTile,
  getDoraTile,
  getTatsuMachi,
  getTilesValueString,
  getTileWind,
  isEqualTile,
  isStrictEqualTile,
  isSyuupai,
  isYakuhai,
  isYaochuuhai,
  isZihai,
  syuupaiTypes,
  tileNames,
} from '../tile'
import type { Yaku, YakuPredicate } from '../../types/yaku'
import { availableTiles } from '../game'
import { Tsu } from '../../types/tile'

const isTenhouOrChiihou: YakuPredicate = ({ jun, bakaze, jikaze, agariType }) => {
  if (jun === 1 && agariType === 'tsumo') return { name: bakaze === jikaze ? '천화' : '지화', han: 13, isYakuman: true }
  return false
}

const isKokushimusou: YakuPredicate = ({ menzen, agariState, agariTsu }) => {
  if (!menzen) return false
  const [kokushi, toitsu] = partition(agariState, (tsu) => tsu.type === 'kokushi')

  if (kokushi.length !== 12 || toitsu.length !== 1 || toitsu[0].type !== 'toitsu') return false
  return agariTsu.type === 'kokushi'
    ? { name: '국사무쌍', han: 13, isYakuman: true }
    : { name: '국사무쌍 13면 대기', han: 26, isYakuman: true }
}

const isMenzenTsumo: YakuPredicate = ({ agariType, menzen }) =>
  menzen && agariType === 'tsumo' && { name: '멘젠쯔모', han: 1 }

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
  const yakuhai = agariState.filter(
    (tsu) => (tsu.type === 'koutsu' || tsu.type === 'kantsu') && isYakuhai(tsu.tiles[0], bakaze, jikaze)
  )
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

const isRyuuiisou: YakuPredicate = ({ agariState }) => {
  const allowed = (['2s', '3s', '4s', '6s', '8s', '6z'] as const).map(codeToTile)
  return (
    agariState.every((tsu) => tsu.tiles.every((tile) => allowed.some((t) => isEqualTile(t, tile)))) && {
      name: '녹일색',
      han: 13,
      isYakuman: true,
    }
  )
}

const isIipeikou: YakuPredicate = ({ agariState, menzen }) => {
  if (!menzen) return false
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

const isIttsuu: YakuPredicate = ({ agariState, menzen }) => {
  return syuupaiTypes.some((type) => {
    const values = agariState
      .filter((tsu) => tsu.type === 'shuntsu' && tsu.tiles[0].type === type)
      .map((tsu) => getTilesValueString(tsu.tiles))
    return (
      values.some((value) => value === '123') &&
      values.some((value) => value === '456') &&
      values.some((value) => value === '789')
    )
  })
    ? { name: '일기통관', han: menzen ? 2 : 1 }
    : false
}

const isSanshoku: YakuPredicate = ({ agariState, menzen }) => {
  const test = (type: 'jun' | 'kou'): Yaku | false => {
    const tsuTypes: Tsu['type'][] = type === 'jun' ? ['shuntsu'] : ['koutsu', 'kantsu']
    const tsuPerTypes = syuupaiTypes.map((type) => [
      ...new Set(
        agariState
          .filter((tsu) => tsuTypes.includes(tsu.type) && tsu.tiles[0].type === type)
          .map((tsu) => getTilesValueString(tsu.tiles).slice(0, 3))
      ),
    ])

    if (tsuPerTypes[0].some((seq) => tsuPerTypes[1].includes(seq) && tsuPerTypes[2].includes(seq))) {
      return type === 'jun' ? { name: '삼색동순', han: menzen ? 2 : 1 } : { name: '삼색동각', han: 2 }
    }
    return false
  }

  const jun = test('jun')
  if (jun) return jun

  const kou = test('kou')
  if (kou) return kou

  return false
}

const isYaochuuhaiYaku: YakuPredicate = ({ agariState, menzen }) => {
  if (agariState.every((tsu) => tsu.tiles.some(isYaochuuhai))) {
    if (agariState.every((tsu) => tsu.tiles.every(isYaochuuhai))) {
      if (agariState.every((tsu) => tsu.tiles.every(isZihai))) {
        return { name: '자일색', han: 13, isYakuman: true }
      }
      if (agariState.every((tsu) => tsu.tiles.every(isSyuupai))) {
        return { name: '청노두', han: 13, isYakuman: true }
      }
      return { name: '혼노두', han: 2 }
    }
    if (agariState.every((tsu) => tsu.tiles.every(isSyuupai))) {
      return { name: '준찬타', han: menzen ? 3 : 2 }
    }
    return { name: '찬타', han: menzen ? 2 : 1 }
  }
  return false
}

const isSankantsu: YakuPredicate = ({ agariState }) => {
  const kantsuCount = agariState.filter((tsu) => tsu.type === 'kantsu').length
  if (kantsuCount === 4) return { name: '스깡쯔', han: 13, isYakuman: true }
  if (kantsuCount === 3) return { name: '산깡쯔', han: 2 }
  return false
}

const isSangen: YakuPredicate = ({ agariState }) => {
  const sangenCount = agariState
    .filter((tsu) => tsu.tiles[0].type === 'dragon')
    .reduce((count, tsu) => count + Math.min(3, tsu.tiles.length), 0)

  if (sangenCount === 9) return { name: '대삼원', han: 13, isYakuman: true }
  if (sangenCount === 8) return { name: '소삼원', han: 2 }
  return false
}

const isSuushiihou: YakuPredicate = ({ agariState }) => {
  const suushiiCount = agariState
    .filter((tsu) => tsu.tiles[0].type === 'wind')
    .reduce((count, tsu) => count + Math.min(3, tsu.tiles.length), 0)

  if (suushiiCount === 12) return { name: '대사희', han: 26, isYakuman: true }
  if (suushiiCount === 11) return { name: '소사희', han: 13, isYakuman: true }
  return false
}

const isChuuren: YakuPredicate = ({ agariState, agariTile, menzen }) => {
  if (!menzen || agariState.some((tsu) => tsu.type === 'kantsu')) return false
  const tiles = agariState.flatMap((tsu) => tsu.tiles.filter((tile) => tile.type === agariTile.type))
  if (
    ![1, 9].every((value) => tiles.filter((tile) => tile.value === value).length >= 3) ||
    ![2, 3, 4, 5, 6, 7, 8].every((value) => tiles.filter((tile) => tile.value === value).length >= 1)
  )
    return false

  return tiles.filter((tile) => isEqualTile(agariTile, tile)).length % 2 === 0
    ? { name: '순정구련보등', han: 26, isYakuman: true }
    : { name: '구련보등', han: 13, isYakuman: true }
}

const isDora: YakuPredicate = ({ agariState, doraTiles }) => {
  const count = agariState
    .map(
      (tsu) =>
        tsu.tiles.filter((tile) => doraTiles.some((dora) => isEqualTile(tile, getDoraTile(dora, availableTiles))))
          .length
    )
    .reduce((a, b) => a + b)

  return count > 0 ? { name: '도라', han: count, isExtra: true } : false
}

const isAkaDora: YakuPredicate = ({ agariState }) => {
  const count = agariState
    .map((tsu) => tsu.tiles.filter((tile) => tile.attribute === 'red').length)
    .reduce((a, b) => a + b)

  return count > 0 ? { name: '적도라', han: count, isExtra: true } : false
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

  return count > 0 ? { name: '뒷도라', han: count, isExtra: true } : false
}

const yakuPredicates: YakuPredicate[] = [
  isTenhouOrChiihou,
  isKokushimusou,
  isMenzenTsumo,
  isRiichi,
  isChiitoitsu,
  isPinfu,
  isYakuhaiKoutsu,
  isTanyao,
  isToitoi,
  isItsu,
  isRyuuiisou,
  isSanshoku,
  isIipeikou,
  isSanankou,
  isIttsuu,
  isYaochuuhaiYaku,
  isSankantsu,
  isSangen,
  isSuushiihou,
  isChuuren,
  isDora,
  isAkaDora,
  isUraDora,
]

export default yakuPredicates
