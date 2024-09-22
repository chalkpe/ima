import { compareTile } from '@ima/client/utils/tile'
import { byOrder, compareArray, falsyFirst } from '@ima/client/utils/comparator'
import type { Yaku } from '@ima/server/types/yaku'
import type { Tenpai } from '@ima/server/types/tenpai'
import type { AgariScoreboard, Decision, Hand, Wind } from '@ima/server/types/game'

const decisionTypeOrder: Decision['type'][] = [
  'ankan',
  'gakan',
  'daiminkan',
  'pon',
  'chi',
  'nuki',
  'riichi',
  'tsumo',
  'ron',
  'skip_chankan',
  'skip_and_tsumo',
]

export const compareDecisions = (a: Decision, b: Decision) =>
  byOrder(a.type, b.type, decisionTypeOrder) ||
  falsyFirst(a.tile, b.tile, compareTile) ||
  falsyFirst(a.otherTiles, b.otherTiles, (a, b) => compareArray(a, b, compareTile))

export const getWindName = (wind: Wind) => {
  switch (wind) {
    case 'east':
      return '동'
    case 'south':
      return '남'
    case 'west':
      return '서'
    case 'north':
      return '북'
  }
}

export const getWindCode = (wind: Wind) => {
  switch (wind) {
    case 'east':
      return '1z'
    case 'south':
      return '2z'
    case 'west':
      return '3z'
    case 'north':
      return '4z'
  }
}

export const tenpaiStatusText: Record<Tenpai['status'], string> = {
  tenpai: '텐파이',
  furiten: '후리텐',
  muyaku: '역 없음',
}

export const calculateTenpaiState = (list: Tenpai[]) => {
  if (list.every((t) => t.han && t.han.tsumo >= 13 && t.han.ron >= 13)) {
    return { text: '역만 준비', color: '#fac12d', isYakuman: true }
  }

  if (list.some((t) => t.han && (t.han.tsumo >= 13 || t.han.ron >= 13))) {
    return { text: '역만 기회', color: '#ccc', isYakuman: true }
  }

  if (list.some((t) => t.status === 'tenpai')) {
    return { text: tenpaiStatusText['tenpai'], color: 'white', isYakuman: false }
  }

  return undefined
}

export const getTenpaiStatusText = (tenpai: Tenpai) => {
  if (tenpai.status === 'tenpai' && tenpai.han) {
    const min = Math.min(tenpai.han.tsumo, tenpai.han.ron)
    const max = Math.max(tenpai.han.tsumo, tenpai.han.ron)
    return min === max ? `${max}판` : `${min}-${max}판`
  }
  return tenpaiStatusText[tenpai.status]
}

export const getAgariHaiSize = (hand: Hand) => {
  return 3.5 - hand.called.filter((set) => set.tiles.length > 3).length * 0.25
}

const scoreNames: Record<number, string> = {
  5: '만관',
  6: '하네만',
  7: '하네만',
  8: '배만',
  9: '배만',
  10: '배만',
  11: '삼배만',
  12: '삼배만',
  13: '헤아림 역만',
}

export const calculateScoreName = (scoreboard: AgariScoreboard) => {
  if (scoreboard.yakuman > 0) {
    return scoreboard.yakuman === 1 ? '역만' : `${scoreboard.yakuman}배역만`
  }
  return `${scoreboard.han}판 ${scoreNames[Math.min(scoreboard.han, 13)] ?? ''}`
}

export const getYakuFontSize = (yaku: Yaku, _: number, array: Yaku[]) => {
  if (array.length > 10) {
    return '1.5vmin'
  }

  if (array.length > 5) {
    return '2vmin'
  }

  if (!yaku.isYakuman) {
    return '3vmin'
  }

  return '4vmin'
}
