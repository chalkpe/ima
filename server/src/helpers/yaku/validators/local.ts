import { tileToCode } from '@ima/server/helpers/code'
import { compareTile, isSyuupai, isYaochuuhai, isZihai, syuntsuNumbers } from '@ima/server/helpers/tile'
import type { YakuValidator } from '@ima/server/types/yaku'
import type { SyuupaiType } from '@ima/server/types/tile'

const isRenhou: YakuValidator = {
  level: 'yakuman',
  predicate: ({ jun, agariType, called }) =>
    jun === 0 &&
    agariType === 'ron' &&
    called.me === undefined &&
    called.opponent === undefined && { name: '인화', han: 13, isYakuman: true },
}

const isIipinMouyue: YakuValidator = {
  level: 'normal',
  predicate: ({ agariTile, agariTileType }) =>
    agariTileType === 'haitei' &&
    agariTile.type === 'pin' &&
    agariTile.value === 1 && { name: '일통모월', han: 5, invalidates: ['해저로월'] },
}

const isChuupinRaoyui: YakuValidator = {
  level: 'normal',
  predicate: ({ agariTile, agariTileType }) =>
    agariTileType === 'houtei' &&
    agariTile.type === 'pin' &&
    agariTile.value === 9 && { name: '구통노어', han: 5, invalidates: ['하저로어'] },
}

const isIshinouenimosannen: YakuValidator = {
  level: 'yakuman',
  predicate: ({ menzen, riichi, agariTileType }) =>
    menzen &&
    riichi === 1 &&
    (agariTileType === 'haitei' || agariTileType === 'houtei') && { name: '석상삼년', han: 13, isYakuman: true },
}

const isKanfuri: YakuValidator = {
  level: 'normal',
  predicate: ({ agariType, jun, opponentJun, called }) => {
    if (agariType !== 'ron' || called.opponent === undefined) return false
    switch (called.opponent.type) {
      case 'daiminkan':
        return called.opponent.jun === jun && { name: '깡후리', han: 1 }
      case 'ankan':
      case 'gakan':
        return called.opponent.jun === opponentJun && { name: '깡후리', han: 1 }
      default:
        return false
    }
  },
}

const isTsubamegaeshi: YakuValidator = {
  level: 'normal',
  predicate: ({ agariType, opponentJun, opponentRiichi }) =>
    agariType === 'ron' && opponentJun === opponentRiichi && { name: '츠바메가에시', han: 1 },
}

const isUumensai: YakuValidator = {
  level: 'normal',
  predicate: ({ agariState }) =>
    new Set(agariState.flatMap(({ tiles }) => tiles.map(({ type }) => type))).size === 5 && { name: '오문제', han: 2 },
}

const isSanrenkou: YakuValidator = {
  level: 'normal',
  predicate: ({ agariState }) => {
    const koutsu = agariState.filter((tsu) => tsu.type === 'koutsu' || tsu.type === 'kantsu')
    return (
      koutsu.length >= 3 &&
      Object.values(
        koutsu.reduce(
          (record, tsu) => {
            const tile = tsu.tiles[0]
            if (isSyuupai(tile)) record[tile.type].add(tile.value)
            return record
          },
          { man: new Set(), pin: new Set(), sou: new Set() } as Record<SyuupaiType, Set<number>>
        )
      ).some(
        (v) =>
          v.size >= 3 &&
          syuntsuNumbers.some((s) =>
            [...v]
              .toSorted((a, b) => a - b)
              .join('')
              .includes(s)
          )
      ) && {
        name: '삼연각',
        han: 2,
      }
    )
  },
}

const isIsshokusanjun: YakuValidator = {
  level: 'yakuman',
  predicate: ({ menzen, agariState }) => {
    const counts = Object.values(
      agariState
        .filter((tsu) => tsu.type === 'shuntsu')
        .map((tsu) => tsu.tiles.toSorted(compareTile).map(tileToCode).join(''))
        .reduce((map, code) => ({ ...map, [code]: (map[code] || 0) + 1 }), {} as Record<string, number>)
    )
    if (counts.some((count) => count === 4)) return { name: '일색사순', han: 13, isYakuman: true }
    if (counts.some((count) => count === 3)) return { name: '일색삼순', han: menzen ? 3 : 2, invalidates: ['이페코'] }
    return false
  },
}

const isShiiaruraotai: YakuValidator = {
  level: 'normal',
  predicate: ({ menzen, agariState, agariTsu }) =>
    !menzen &&
    agariState.filter((tsu) => tsu.furo).length === 4 &&
    agariTsu.type === 'toitsu' && { name: '십이낙태', han: 1 },
}

const isDaisharin: YakuValidator = {
  level: 'yakuman',
  predicate: ({ menzen, agariState }) => {
    if (!menzen || agariState.length !== 7 || !agariState.every((tsu) => tsu.type === 'toitsu')) return false
    if (!agariState.every((tsu) => tsu.tiles.every((tile) => !isYaochuuhai(tile)))) return false

    const types = [...new Set(agariState.map((tsu) => tsu.tiles[0].type)).values()]
    if (types.length !== 1) return false

    switch (types[0]) {
      case 'man':
        return { name: '대수린', han: 26, isYakuman: true }
      case 'pin':
        return { name: '대차륜', han: 26, isYakuman: true }
      case 'sou':
        return { name: '대죽림', han: 26, isYakuman: true }
      /* istanbul ignore next */ default:
        return false
    }
  },
}

const isDaichisei: YakuValidator = {
  level: 'yakuman',
  predicate: ({ menzen, agariState }) =>
    menzen &&
    agariState.length === 7 &&
    agariState.every((tsu) => tsu.type === 'toitsu' && tsu.tiles.every(isZihai)) && {
      name: '대칠성',
      han: 26,
      isYakuman: true,
      invalidates: ['자일색'],
    },
}

const yakuValidators: YakuValidator[] = [
  isRenhou,
  isIipinMouyue,
  isChuupinRaoyui,
  isIshinouenimosannen,
  isKanfuri,
  isTsubamegaeshi,
  isUumensai,
  isSanrenkou,
  isIsshokusanjun,
  isShiiaruraotai,
  isDaisharin,
  isDaichisei,
]

export default yakuValidators
