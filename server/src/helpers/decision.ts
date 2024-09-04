import { tileToCode } from './code'
import { calculateYaku } from './yaku'
import { calculateAgari } from './agari'
import { combination, combinations, partition } from './common'
import { getClosedHand, getOpponent, getRiverEnd, isMenzenHand } from './game'
import { countTiles, getAllSyuntsu, isEqualTile, isStrictEqualTile, removeTileFromHand } from './tile'

import type { Decision, GameState, PlayerType } from '../types/game'

export const calculateChiDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []

  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const furoTile = riverEnd.tile

  const closedHand = state[me].hand.closed
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
    .flatMap((tatsu) => combinations(tatsu).map((tiles) => ({ type: 'chi', tile: furoTile, otherTiles: tiles })))
}

export const calculatePonDaiminkanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []

  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const furoTile = riverEnd.tile

  const [_, removed] = removeTileFromHand(state[me].hand.closed, furoTile, 3)
  if (removed.length === 3)
    return [
      { type: 'daiminkan', tile: furoTile, otherTiles: removed },
      ...combination(removed)
        .filter(
          (tiles, index, array) =>
            array.findIndex((t) => isStrictEqualTile(t[0], tiles[0]) && isStrictEqualTile(t[1], tiles[1])) === index
        )
        .map((tiles) => ({ type: 'pon', tile: furoTile, otherTiles: tiles } satisfies Decision)),
    ]

  if (removed.length === 2) return [{ type: 'pon', tile: furoTile, otherTiles: removed }]

  return []
}

export const calculateGakanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []

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
  const closedHand = getClosedHand(state[me].hand)
  const tileCounts = countTiles(closedHand)

  return Object.entries(tileCounts)
    .filter(([_, count]) => count === 4)
    .map(([code, _]) => closedHand.filter((tile) => tileToCode(tile) === code))
    .map(([tile, ...otherTiles]) => ({ type: 'ankan', tile, otherTiles }))
}

export const calculateRiichiDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].riichi) return []

  if (state[me].hand.tsumo === undefined) return []
  if (!isMenzenHand(state[me].hand)) return []

  const hand = getClosedHand(state[me].hand)

  return hand
    .filter((tile, index) => hand.findIndex((t) => isStrictEqualTile(tile, t)) === index)
    .map((tile) => partition(hand, (t) => t.index === tile.index))
    .map(([removed, hand]) => [removed[0], calculateAgari(hand)] as const)
    .filter(([_, result]) => result.status === 'tenpai')
    .map(([removed]) => ({ type: 'riichi', tile: removed }))
}

export const calculateTsumoDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].hand.tsumo === undefined) return []
  const hand = getClosedHand(state[me].hand)

  const result = calculateAgari(hand)
  return result.status === 'agari' &&
    calculateYaku(state, me, state[me].hand, 'tsumo', state[me].hand.tsumo).some((yaku) => !yaku.isExtra)
    ? [{ type: 'tsumo', tile: state[me].hand.tsumo }]
    : []
}

export const calculateRonDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const ronTile = riverEnd.tile
  const hand = [...state[me].hand.closed, ronTile]

  const result = calculateAgari(hand)
  return result.status === 'agari' &&
    calculateYaku(state, me, state[me].hand, 'ron', ronTile).some((yaku) => !yaku.isExtra)
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