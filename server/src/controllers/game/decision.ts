import { Decision, GameState, Player, PlayerType } from '../../db'
import { calculateAgari } from '../../helpers/agari'
import { tileToCode } from '../../helpers/code'
import {
  countTiles,
  getClosedHand,
  getOpponent,
  getRiverEnd,
  isEqualTile,
  removeTileFromHand,
} from '../../helpers/common'

const calculateAnkanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const closedHand = getClosedHand(state[me].hand)
  const tileCounts = countTiles(closedHand)

  return Object.entries(tileCounts)
    .filter(([_, count]) => count === 4)
    .map(([code, _]) => closedHand.filter((tile) => tileToCode(tile) === code))
    .map(([tile, ...otherTiles]) => ({ type: 'ankan', tile, otherTiles }))
}

const calculateGakanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const { tsumo } = state[me].hand
  if (!tsumo) return []

  const pon = state[me].hand.called.find(
    (set) => set.type === 'pon' && set.calledTile && isEqualTile(set.calledTile, tsumo)
  )
  return pon ? [{ type: 'gakan', tile: tsumo }] : []
}

const calculateTsumoDecisions = (state: GameState, me: PlayerType): Decision[] => {
  if (state[me].hand.tsumo === undefined) return []
  const hand = getClosedHand(state[me].hand)

  const result = calculateAgari(hand)
  return result.status === 'agari' ? [{ type: 'tsumo', tile: state[me].hand.tsumo }] : []
}

const calculateRonDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const ronTile = riverEnd.tile
  const hand = [...state[me].hand.closed, ronTile]

  const result = calculateAgari(hand)
  return result.status === 'agari' ? [{ type: 'ron', tile: ronTile }] : []
}

const calculatePonKanDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])

  if (!riverEnd) return []
  const furoTile = riverEnd.tile

  const [_, removed] = removeTileFromHand(state[me].hand.closed, furoTile, 3)
  if (removed.length === 3)
    return [
      { type: 'daiminkan', tile: furoTile, otherTiles: removed },
      { type: 'pon', tile: furoTile, otherTiles: removed },
    ]

  if (removed.length === 2) return [{ type: 'pon', tile: furoTile, otherTiles: removed }]

  return []
}

export const calculateAfterOpponentKanDecisions = (state: GameState, me: PlayerType): Decision[] => {
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

export const calculateBeforeTsumoDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const decisions = [...calculateRonDecisions(state, me), ...calculatePonKanDecisions(state, me)]
  return decisions.length > 0 ? [...decisions, { type: 'skip_and_tsumo' }] : []
}

export const calculateAfterTsumoDecisions = (state: GameState, me: PlayerType) => {
  return [
    ...calculateAnkanDecisions(state, me),
    ...calculateGakanDecisions(state, me),
    ...calculateTsumoDecisions(state, me),
  ]
}
