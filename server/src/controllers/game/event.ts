import { tsumo } from './action'
import {
  calculateAfterOpponentKanDecisions,
  calculateAfterTsumoDecisions,
  calculateBeforeTsumoDecisions,
} from './decision'

import { calculateAgari } from '../../helpers/agari'
import { codeToTile } from '../../helpers/code'
import { getOpponent } from '../../helpers/game'

import type { GameState, PlayerType } from '../../types/game'

export const onHandChange = (state: GameState, me: PlayerType) => {
  state[me].hand.tenpai = [
    ...state[me].hand.closed.map((_, index, closed) => [...closed.filter((_, i) => i !== index), ...(state[me].hand.tsumo ? [state[me].hand.tsumo] : [])]),
    state[me].hand.closed,
  ].map((hand) => [...calculateAgari(hand).tenpai.keys()].map(codeToTile))
}

export const onBeforeTsumo = (state: GameState, me: PlayerType) => {
  state[me].decisions = calculateBeforeTsumoDecisions(state, me)
  if (state[me].decisions.length === 0) {
    tsumo(state, me, 'haiyama')
  }
}

export const onAfterTsumo = (state: GameState, me: PlayerType) => {
  state[me].decisions = calculateAfterTsumoDecisions(state, me)
  onHandChange(state, me)
}

export const onBeforeGiri = (state: GameState, me: PlayerType) => {
  const opponent = getOpponent(me)
  state.turn = opponent
}

export const onAfterGiri = (state: GameState, me: PlayerType) => {
  state[me].decisions = []
  state[me].hand.tsumo = undefined
  onHandChange(state, me)
}

export const onAfterAnkan = (state: GameState, me: PlayerType) => {
  onHandChange(state, me)
  const opponent = getOpponent(me)

  state[opponent].decisions = calculateAfterOpponentKanDecisions(state, opponent)
  if (state[opponent].decisions.length > 0) {
    state.turn = opponent
  } else {
    tsumo(state, me, 'lingshang')
  }
}

export const onAfterGakan = (state: GameState, me: PlayerType) => {
  onHandChange(state, me)
  const opponent = getOpponent(me)

  state[opponent].decisions = calculateAfterOpponentKanDecisions(state, opponent)
  if (state[opponent].decisions.length > 0) {
    state.turn = opponent
  } else {
    tsumo(state, me, 'lingshang')
  }
}
