import { tsumo } from '@ima/server/controllers/game/action'
import {
  calculateAfterOpponentKanDecisions,
  calculateAfterTsumoDecisions,
  calculateBeforeTsumoDecisions,
} from '@ima/server/controllers/game/decision'
import { getClosedHand, getOpponent } from '@ima/server/helpers/game'
import { calculateTenpai } from '@ima/server/helpers/tenpai'

import type { GameState, PlayerType } from '@ima/server/types/game'

export const onHandChange = (state: GameState, me: PlayerType) => {
  const isRiichi = state[me].riichi
  const closedHand = getClosedHand(state[me].hand)

  const giriTiles = isRiichi ? [...(state[me].hand.tsumo ? [state[me].hand.tsumo] : []), null] : [...closedHand, null]
  state[me].hand.tenpai = giriTiles.flatMap((giriTile) => {
    const hand =
      giriTile === null
        ? { ...state[me].hand, closed: closedHand, tsumo: undefined }
        : { ...state[me].hand, closed: closedHand.filter((t) => giriTile.index !== t.index), tsumo: undefined }
    const tenpai = calculateTenpai(state, me, hand, giriTile)
    return tenpai ? tenpai : []
  })
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
