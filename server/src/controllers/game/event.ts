import { GameState, PlayerType } from '../../db'
import { calculateAgari } from '../../helpers/agari'
import { codeToTile } from '../../helpers/code'
import { getOpponent } from '../../helpers/common'
import { tsumo } from './action'
import {
  calculateAfterOpponentKanDecisions,
  calculateAfterTsumoDecisions,
  calculateBeforeTsumoDecisions,
} from './decision'

export const onBeforeTsumo = (state: GameState, me: PlayerType) => {
  state[me].decisions = calculateBeforeTsumoDecisions(state, me)
  if (state[me].decisions.length === 0) {
    tsumo(state, me, 'haiyama')
  }
}

export const onAfterTsumo = (state: GameState, me: PlayerType) => {
  state[me].decisions = calculateAfterTsumoDecisions(state, me)
  state[me].hand.tenpai = [
    ...state[me].hand.closed.map((_, index, array) => {
      const hand = array.filter((_, i) => i !== index)
      return state[me].hand.tsumo ? [...hand, state[me].hand.tsumo] : hand
    }),
    state[me].hand.closed,
  ].map((hand) => {
    const result = calculateAgari(hand)
    return result.status === 'tenpai' ? [...result.tenpai.keys()].map(codeToTile) : []
  })
}

export const onBeforeGiri = (state: GameState, me: PlayerType) => {
  const opponent = getOpponent(me)
  state.turn = opponent
}

export const onAfterGiri = (state: GameState, me: PlayerType) => {
  state[me].decisions = []
  state[me].hand.tsumo = undefined
  state[me].hand.tenpai = [
    ...Array(state[me].hand.closed.length).fill([]),
    [...calculateAgari(state[me].hand.closed).tenpai.keys()].map(codeToTile),
  ]
}

export const onAfterAnkan = (state: GameState, me: PlayerType) => {
  const opponent = getOpponent(me)

  state[opponent].decisions = calculateAfterOpponentKanDecisions(state, opponent)
  if (state[opponent].decisions.length > 0) {
    state.turn = opponent
  } else {
    tsumo(state, me, 'lingshang')
  }
}
