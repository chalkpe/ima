import { tsumo } from '@ima/server/controllers/game/action'
import { hideTile, isEqualTile } from '@ima/server/helpers/tile'
import { applyAgariScoreboard, applyRyukyokuScoreboard } from '@ima/server/helpers/scoreboard'
import { availableTiles, doraIndices, getClosedHand, getOpponent, haipaiCounts } from '@ima/server/helpers/game'
import type { SimpleTile } from '@ima/server/types/tile'
import type { GameState, PlayerType } from '@ima/server/types/game'

export const getVisibleState = (state: GameState, me: PlayerType): GameState => {
  const opponent = getOpponent(me)

  return {
    ...state,
    [opponent]: {
      ...state[opponent],
      hand: {
        ...state[opponent].hand,
        closed: state[opponent].hand.closed.map(hideTile),
        tsumo: state[opponent].hand.tsumo ? hideTile(state[opponent].hand.tsumo) : undefined,
        tenpai: [],
      },
      decisions: [],
    },
    wall: {
      ...state.wall,
      tiles: state.wall.tiles.map(hideTile),
      kingTiles: state.wall.kingTiles.map((tile, index) =>
        doraIndices.slice(0, state.wall.doraCount).includes(index) ? tile : hideTile(tile)
      ),
      supplementTiles: state.wall.supplementTiles.map(hideTile),
    },
  }
}

export const initState = (state: GameState) => {
  const tiles = availableTiles.map((tile) => ({ ...tile }))
  for (let i = tiles.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[rand]] = [tiles[rand], tiles[i]]
  }

  const now = Date.now()
  tiles.forEach((tile, index) => (tile.index = index + now))

  state.wall.doraCount = 1
  state.wall.kingTiles = tiles.splice(0, 14)
  state.wall.supplementTiles = []

  state.host.hand.closed = []
  state.host.hand.tsumo = undefined
  state.host.hand.called = []
  state.host.hand.tenpai = []
  state.host.decisions = []
  state.host.river = []
  state.host.riichi = null
  state.host.jun = 0

  state.guest.hand.closed = []
  state.guest.hand.tsumo = undefined
  state.guest.hand.called = []
  state.guest.hand.tenpai = []
  state.guest.decisions = []
  state.guest.river = []
  state.guest.riichi = null
  state.guest.jun = 0

  haipaiCounts.forEach((count) => {
    state.host.hand.closed.push(...tiles.splice(0, count))
    state.guest.hand.closed.push(...tiles.splice(0, count))
  })

  state.wall.tiles = tiles
  state.wall.firstTileIndex = tiles[0].index
  state.wall.lastTileIndex = tiles[tiles.length - 1].index
}

export const getRemainingTileCount = (state: GameState, me: PlayerType, tile: SimpleTile) => {
  const opponent = getOpponent(me)
  const visibleState = getVisibleState(state, me)

  const fullTiles = availableTiles.filter((t) => isEqualTile(t, tile))
  const visibleTiles = [
    ...getClosedHand(visibleState[me].hand),
    ...getClosedHand(visibleState[opponent].hand),
    ...visibleState[me].hand.called.flatMap((set) => set.tiles),
    ...visibleState[opponent].hand.called.flatMap((set) => set.tiles),
    ...visibleState[me].river.map((r) => r.tile),
    ...visibleState[opponent].river.map((r) => r.tile),
    ...visibleState.wall.tiles,
    ...visibleState.wall.kingTiles,
    ...visibleState.wall.supplementTiles,
  ].filter((t) => isEqualTile(t, tile))

  return fullTiles.length - visibleTiles.length
}

export const confirmScoreboard = (state: GameState, me: PlayerType): 'update' | 'start' | 'end' => {
  const scoreboard = state.scoreboard
  if (!scoreboard) throw new Error('Scoreboard is not ready')

  scoreboard[me === 'host' ? 'hostConfirmed' : 'guestConfirmed'] = true
  if (!scoreboard.hostConfirmed || !scoreboard.guestConfirmed) return 'update'

  if (scoreboard.type === 'final') return 'end'
  const next =
    scoreboard.type === 'agari' ? applyAgariScoreboard(state, scoreboard) : applyRyukyokuScoreboard(state, scoreboard)

  if (typeof next !== 'string') {
    state.scoreboard = next
    return 'update'
  }

  state.scoreboard = undefined
  state[me].wind = next === me ? 'east' : 'west'
  state[getOpponent(me)].wind = next === me ? 'west' : 'east'

  initState(state)
  state.turn = next
  tsumo(state, next, 'haiyama')

  return 'start'
}
