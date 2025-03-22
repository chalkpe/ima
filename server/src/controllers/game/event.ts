import { tsumo } from '@ima/server/controllers/game/action'
import {
  calculateAfterOpponentKanDecisions,
  calculateAfterTsumoDecisions,
  calculateBeforeTsumoDecisions,
} from '@ima/server/controllers/game/decision'
import { getClosedHand, getOpponent } from '@ima/server/helpers/game'
import { calculateTenpai } from '@ima/server/helpers/tenpai'

import type { GameState, PlayerType } from '@ima/server/types/game'

export const onHandChange = async (state: GameState, me: PlayerType) => {
  const isRiichi = state[me].riichi
  const closedHand = getClosedHand(state[me].hand)

  const giriTiles = isRiichi ? [...(state[me].hand.tsumo ? [state[me].hand.tsumo] : []), null] : [...closedHand, null]
  const res = await Promise.all(
    giriTiles.map(async (giriTile) => {
      const hand =
        giriTile === null
          ? { ...state[me].hand, closed: closedHand, tsumo: undefined }
          : { ...state[me].hand, closed: closedHand.filter((t) => giriTile.index !== t.index), tsumo: undefined }

      return await calculateTenpai(state, me, hand, giriTile)
    })
  )

  state[me].hand.tenpai = res.flatMap((r) => (r ? r : []))
}

export const onBeforeTsumo = async (state: GameState, me: PlayerType): Promise<'update' | 'end'> => {
  state[me].decisions = await calculateBeforeTsumoDecisions(state, me)
  if (state[me].decisions.length === 0) {
    return await tsumo(state, me, 'haiyama')
  } else {
    return 'update'
  }
}

export const onAfterTsumo = async (state: GameState, me: PlayerType) => {
  state[me].decisions = await calculateAfterTsumoDecisions(state, me)
  await onHandChange(state, me)
}

export const onBeforeGiri = async (state: GameState, me: PlayerType) => {
  const opponent = getOpponent(me)
  state.turn = opponent
}

export const onAfterGiri = async (state: GameState, me: PlayerType) => {
  state[me].decisions = []
  state[me].hand.tsumo = undefined
  await onHandChange(state, me)
}

export const onAfterAnkan = async (state: GameState, me: PlayerType) => {
  await onHandChange(state, me)
  const opponent = getOpponent(me)

  state[opponent].decisions = await calculateAfterOpponentKanDecisions(state, opponent)
  if (state[opponent].decisions.length > 0) {
    state.turn = opponent
  } else {
    await tsumo(state, me, 'lingshang')
  }
}

export const onAfterGakan = async (state: GameState, me: PlayerType) => {
  await onHandChange(state, me)
  const opponent = getOpponent(me)

  state[opponent].decisions = await calculateAfterOpponentKanDecisions(state, opponent)
  if (state[opponent].decisions.length > 0) {
    state.turn = opponent
  } else {
    await tsumo(state, me, 'lingshang')
  }
}
