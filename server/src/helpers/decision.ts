import { codeToTile, compareCode, tileToCode } from '@ima/server/helpers/code'
import { calculateYaku, isYakuOverShibari } from '@ima/server/helpers/yaku'
import { calculateAgari } from '@ima/server/helpers/agari'
import { calculateFuriten } from '@ima/server/helpers/tenpai'
import { combination, combinations, partition } from '@ima/server/helpers/common'
import { getClosedHand, getOpponent, getRiverEnd, isMenzenHand } from '@ima/server/helpers/game'
import {
  countTiles,
  getAllSyuntsu,
  isEqualTile,
  isStrictEqualTile,
  isSyuntsu,
  removeTileFromHand,
  simpleTileToTile,
} from '@ima/server/helpers/tile'

import type { Decision, GameState, PlayerType } from '@ima/server/types/game'

export const calculateChiDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []
  if (state.wall.tiles.length === 0) return []

  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const furoTile = riverEnd.tile

  const closedHand = state[me].hand.closed
  if (closedHand.length <= 2) return []

  return getAllSyuntsu(furoTile)
    .map((mentsu) => mentsu.filter((tile) => !isEqualTile(tile, furoTile)))
    .map((tatsu) =>
      tatsu.map((tile) =>
        closedHand
          .filter((t) => isEqualTile(tile, t))
          .filter((t, index, array) => array.findIndex((tt) => isStrictEqualTile(t, tt)) === index)
      )
    )
    .filter(([a, b]) => a.length > 0 && b.length > 0)
    .flatMap((tatsu) =>
      combinations(tatsu).map((tiles) => ({ type: 'chi', tile: furoTile, otherTiles: tiles }) as Decision)
    )
    .filter(
      ({ otherTiles }) =>
        otherTiles &&
        otherTiles.length === 2 &&
        closedHand
          .filter((handTile) => !otherTiles.some((t) => t.index === handTile.index))
          .some((handTile) => !isSyuntsu([handTile, otherTiles[0], otherTiles[1]]))
    )
}

export const calculatePonDaiminkanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []
  if (state.wall.tiles.length === 0) return []

  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const furoTile = riverEnd.tile

  const [remain, removed] = removeTileFromHand(state[me].hand.closed, furoTile, 3)

  // daiminkan or pon
  if (remain.length > 0 && removed.length === 3)
    return [
      ...(state.wall.doraCount === 5
        ? []
        : [{ type: 'daiminkan', tile: furoTile, otherTiles: removed } satisfies Decision]),
      ...combination(removed)
        .filter(
          (tiles, index, array) =>
            array.findIndex((t) => isStrictEqualTile(t[0], tiles[0]) && isStrictEqualTile(t[1], tiles[1])) === index
        )
        .map((tiles) => ({ type: 'pon', tile: furoTile, otherTiles: tiles }) satisfies Decision),
    ]

  // pon
  if (remain.length > 0 && removed.length === 2) return [{ type: 'pon', tile: furoTile, otherTiles: removed }]

  return []
}

export const calculateGakanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []
  if (state.wall.doraCount === 5) return []

  const hand = state[me].hand
  const closedHand = getClosedHand(hand)
  const tileCounts = countTiles(closedHand)

  return Object.entries(tileCounts)
    .filter(([_, count]) => count === 1)
    .map(([code]) => hand.called.find((s) => s.type === 'pon' && s.calledTile && tileToCode(s.calledTile) === code))
    .filter((minkou) => minkou !== undefined)
    .map((minkou) => closedHand.filter((tile) => isEqualTile(tile, minkou.tiles[0])))
    .map(([tile]) => ({ type: 'gakan', tile }))
}

export const calculateAnkanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state.wall.doraCount === 5) return []

  const closedHand = getClosedHand(state[me].hand)
  const tileCounts = countTiles(closedHand)

  const kantsu = Object.entries(tileCounts)
    .filter(([_, count]) => count === 4)
    .map(([code, _]) => closedHand.filter((tile) => tileToCode(tile) === code))

  if (state[me].riichi) {
    return kantsu
      .filter((tsu) => tsu.some((tile) => tile.index === state[me].hand.tsumo?.index))
      .filter((tsu) => {
        const current = calculateAgari(state[me].hand.closed)
        const future = calculateAgari(closedHand.filter((tile) => !isEqualTile(tile, tsu[0])))
        return (
          [...current.tenpai.keys()].toSorted(compareCode).join(',') ===
          [...future.tenpai.keys()].toSorted(compareCode).join(',')
        )
      })
      .map((tiles) => {
        const [tile, otherTiles] = partition(tiles, (t) => t.index === state[me].hand.tsumo?.index)
        return { type: 'ankan', tile: tile[0], otherTiles }
      })
  }

  return kantsu.map((tiles) => {
    const sorted = tiles.toSorted((a, b) => a.index - b.index)
    return { type: 'ankan', tile: sorted[sorted.length - 1], otherTiles: sorted.slice(0, -1) }
  })
}

export const calculateRiichiDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []
  if (state.wall.tiles.length < 2) return []

  if (state[me].hand.tsumo === undefined) return []
  if (!isMenzenHand(state[me].hand)) return []

  const hand = getClosedHand(state[me].hand)
  return hand
    .filter((tile, index) => hand.findIndex((t) => isStrictEqualTile(tile, t)) === index)
    .map((tile) => partition(hand, (t) => t.index === tile.index))
    .map(([removed, hand]) => [removed[0], hand, calculateAgari(hand)] as const)
    .filter(
      ([_, hand, result]) =>
        result.status === 'tenpai' &&
        [...result.tenpai.keys()]
          .map((code) => simpleTileToTile(codeToTile(code)))
          .some((tile) =>
            isYakuOverShibari(
              state,
              calculateYaku(state, me, { ...state[me].hand, closed: hand, tsumo: tile }, 'tsumo', tile)
            )
          )
    )
    .map(([tile]) => ({ type: 'riichi', tile }))
}

export const calculateTsumoDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].hand.tsumo === undefined) return []
  const hand = getClosedHand(state[me].hand)

  const result = calculateAgari(hand)
  return result.status === 'agari' &&
    isYakuOverShibari(state, calculateYaku(state, me, state[me].hand, 'tsumo', state[me].hand.tsumo))
    ? [{ type: 'tsumo', tile: state[me].hand.tsumo }]
    : []
}

export const calculateRonDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const ronTile = riverEnd.tile

  const result = calculateAgari(state[me].hand.closed)
  return result.status === 'tenpai' &&
    [...result.tenpai.keys()].includes(tileToCode(ronTile)) &&
    [...result.tenpai.values()].every((tenpai) => tenpai.every((ten) => calculateFuriten(state, me, ten, null))) &&
    isYakuOverShibari(state, calculateYaku(state, me, state[me].hand, 'ron', ronTile))
    ? [{ type: 'ron', tile: ronTile }]
    : []
}

export const calculateChankanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const opponent = getOpponent(me)

  const opponentCalled = state[opponent].hand.called
  if (opponentCalled.length === 0) return []

  const { type, tiles } = opponentCalled[opponentCalled.length - 1]

  const lastTile = tiles[tiles.length - 1]
  if (!lastTile || (type !== 'gakan' && type !== 'ankan')) return []

  const hand = [...state[me].hand.closed, lastTile]
  const result = calculateAgari(hand)

  if (result.status !== 'agari') return []
  if (type !== 'gakan' && !result.agari.some((s) => s.some(({ type }) => type === 'kokushi'))) return []

  return [{ type: 'ron', tile: lastTile }, { type: 'skip_chankan' }]
}
