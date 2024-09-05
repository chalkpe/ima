import { hideTile } from '@ima/server/helpers/tile'
import { calculateTenpai } from '@ima/server/helpers/tenpai'
import { getDoraTiles, getNextWind, getOpponent, getUraDoraTiles } from '@ima/server/helpers/game'
import type { AgariType, Yaku } from '@ima/server/types/yaku'
import type {
  AgariScoreboard,
  GameState,
  Hand,
  PlayerType,
  RyuukyokuScoreboard,
  Scoreboard,
} from '@ima/server/types/game'

const eastScoreTable = [0, 1500, 2900, 5800, 11600, 12000, 18000, 18000, 24000, 24000, 24000, 36000, 36000, 48000]
const westScoreTable = [0, 1000, 2000, 3900, 7700, 8000, 12000, 12000, 16000, 16000, 16000, 24000, 24000, 32000]

export const createAgariScoreboard = (
  state: GameState,
  me: PlayerType,
  hand: Hand,
  agariType: AgariType,
  yaku: Yaku[]
): Scoreboard => {
  const han = yaku.reduce((han, yaku) => han + yaku.han, 0)
  const yakuman = yaku
    .filter((y) => y.isYakuman)
    .map((y) => Math.floor(y.han / 13))
    .reduce((a, b) => a + b, 0)

  const oya = state[me].wind === 'east'
  const score =
    yakuman > 0
      ? yakuman * (oya ? eastScoreTable[13] : westScoreTable[13])
      : oya
        ? eastScoreTable[Math.min(13, han)]
        : westScoreTable[Math.min(13, han)]

  const doraTiles = getDoraTiles(state.wall)
  const uraDoraTiles = getUraDoraTiles(state.wall)

  return {
    type: 'agari',
    winner: me,
    hand,
    agariType,
    score,
    han,
    yakuman,
    yaku,
    hostConfirmed: false,
    guestConfirmed: false,
    doraTiles,
    uraDoraTiles: state[me].riichi !== null ? uraDoraTiles : uraDoraTiles.map(hideTile),
  }
}

export const createRyukyokuScoreboard = (state: GameState, me: PlayerType): Scoreboard => {
  return {
    type: 'ryuukyoku',
    hostConfirmed: false,
    guestConfirmed: false,
    tenpai: [me, getOpponent(me)].filter((p) => calculateTenpai(state, p, state[p].hand, null) !== undefined),
  }
}

export const createFinalScoreboard = (state: GameState): Scoreboard => {
  return {
    type: 'final',
    hostConfirmed: false,
    guestConfirmed: false,
    hostScore: state.host.score,
    guestScore: state.guest.score,
  }
}

export const applyAgariScoreboard = (state: GameState, scoreboard: AgariScoreboard): Scoreboard | PlayerType => {
  state[scoreboard.winner].score += scoreboard.score

  if (state[scoreboard.winner].wind === 'east') {
    state.round.honba += 1
  } else {
    state.round.honba = 0
    state.round.kyoku += 1

    if (state.round.kyoku > 2) {
      const nextWind = getNextWind(state.round.wind)
      if (!nextWind) return createFinalScoreboard(state)

      state.round.wind = nextWind
      state.round.kyoku = 1
    }
  }
  return scoreboard.winner
}

export const applyRyukyokuScoreboard = (state: GameState, scoreboard: RyuukyokuScoreboard): Scoreboard | PlayerType => {
  if (scoreboard.tenpai.length === 1) {
    const winner = scoreboard.tenpai[0]
    state[winner].score += 1000
    state[getOpponent(winner)].score -= 1000
  }

  const oya = state.host.wind === 'east' ? 'host' : 'guest'
  if (scoreboard.tenpai.includes(oya)) {
    state.round.honba += 1
    return oya
  } else {
    state.round.kyoku += 1

    if (state.round.kyoku > 2) {
      const nextWind = getNextWind(state.round.wind)
      if (!nextWind) return createFinalScoreboard(state)

      state.round.wind = nextWind
      state.round.kyoku = 1
    }
    return getOpponent(oya)
  }
}
