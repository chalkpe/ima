import { calculateAgari } from '../agari'
import { getDoraTiles, getUraDoraTiles } from '../game'
import yakuPredicates from './predicate'
import type { AgariState } from '../../types/agari'
import type { Tile, Tsu } from '../../types/tile'
import type { GameState, Hand, PlayerType, TileSet } from '../../types/game'
import type { AgariType, Yaku, YakuPredicateParams } from '../../types/yaku'

const calculateYakuOfAgari = (
  state: GameState,
  me: PlayerType,
  agariType: AgariType,
  agariTile: Tile,
  agariState: AgariState
): Yaku[] => {
  const agariTsu = agariState.find((tsu) => tsu.tiles.some((tile) => tile.index === agariTile.index))
  if (!agariTsu) return []

  const params: YakuPredicateParams = {
    agariType,
    agariTile,
    agariState,
    agariTsu,
    bakaze: state.round.wind,
    jikaze: state[me].wind,
    menzen: agariState.every((tsu) => !tsu.open),
    riichi: state[me].riichi,
    doraTiles: getDoraTiles(state.wall),
    uraDoraTiles: getUraDoraTiles(state.wall),
  }
  return yakuPredicates.map((predicate) => predicate(params))
    .filter((res): res is Yaku | Yaku[] => res !== false)
    .flatMap((res) => Array.isArray(res) ? res : [res])
}

export const tileSetToTsu = (s: TileSet): Tsu => {
  switch (s.type) {
    case 'ankan':
      return { type: 'kantsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2], s.tiles[3]], open: false }
    case 'gakan':
    case 'daiminkan':
      return { type: 'kantsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2], s.tiles[3]], open: true }
    case 'chi':
      return { type: 'shuntsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2]], open: true }
    case 'pon':
      return { type: 'koutsu', tiles: [s.tiles[0], s.tiles[1], s.tiles[2]], open: true }
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
    .map((agariState) => calculateYakuOfAgari(state, me, agariType, agariTile, agariState))
    .sort((a, b) => b.reduce((res, yaku) => res + yaku.han, 0) - a.reduce((res, yaku) => res + yaku.han, 0))

  return agariList[0]
}
