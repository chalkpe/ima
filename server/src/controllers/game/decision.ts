import {
  calculateAnkanDecisions,
  calculateChankanDecisions,
  calculateChiDecisions,
  calculateGakanDecisions,
  calculatePonDaiminkanDecisions,
  calculateRiichiDecisions,
  calculateRonDecisions,
  calculateTsumoDecisions,
} from '@ima/server/helpers/decision'

import type { Decision, GameState, PlayerType } from '@ima/server/types/game'

export const calculateBeforeTsumoDecisions = async (state: GameState, me: PlayerType): Promise<Decision[]> => {
  const decisions = [
    ...calculateChiDecisions(state, me),
    ...calculatePonDaiminkanDecisions(state, me),
    ...(await calculateRonDecisions(state, me)),
  ]
  return decisions.length > 0 ? [...decisions, { type: 'skip_and_tsumo' }] : []
}

export const calculateAfterTsumoDecisions = async (state: GameState, me: PlayerType): Promise<Decision[]> => {
  const [ankan, riichi, tsumo] = await Promise.all([
    calculateAnkanDecisions(state, me),
    calculateRiichiDecisions(state, me),
    calculateTsumoDecisions(state, me),
  ])

  return [...ankan, ...calculateGakanDecisions(state, me), ...riichi, ...tsumo]
}

export const calculateAfterOpponentKanDecisions = async (state: GameState, me: PlayerType): Promise<Decision[]> => {
  return [...(await calculateChankanDecisions(state, me))]
}
