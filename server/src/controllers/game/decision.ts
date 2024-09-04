import {
  calculateAnkanDecisions,
  calculateChankanDecisions,
  calculateChiDecisions,
  calculateGakanDecisions,
  calculatePonDaiminkanDecisions,
  calculateRiichiDecisions,
  calculateRonDecisions,
  calculateTsumoDecisions,
} from '../../helpers/decision'

import type { Decision, GameState, PlayerType } from '../../types/game'

export const calculateBeforeTsumoDecisions = (state: GameState, me: PlayerType): Decision[] => {
  const decisions = [
    ...calculateChiDecisions(state, me),
    ...calculatePonDaiminkanDecisions(state, me),
    ...calculateRonDecisions(state, me),
  ]
  return decisions.length > 0 ? [...decisions, { type: 'skip_and_tsumo' }] : []
}

export const calculateAfterTsumoDecisions = (state: GameState, me: PlayerType) => {
  return [
    ...calculateAnkanDecisions(state, me),
    ...calculateGakanDecisions(state, me),
    ...calculateRiichiDecisions(state, me),
    ...calculateTsumoDecisions(state, me),
  ]
}

export const calculateAfterOpponentKanDecisions = (state: GameState, me: PlayerType) => {
  return [...calculateChankanDecisions(state, me)]
}
