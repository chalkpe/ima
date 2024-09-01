import { countTiles, isEqualTile, simpleTileToTile } from '../../helpers/tile'
import { backTile as simpleBackTile } from '../../helpers/code'
import { availableTiles, getClosedHand, getOpponent, haipaiCounts } from '../../helpers/game'
import type { SimpleTile, Tile } from '../../types/tile'
import type { GameState, PlayerType } from '../../types/game'

export const getVisibleState = (state: GameState, me: PlayerType): GameState => {
  const opponent = getOpponent(me)
  const hideTile = (tile: Tile) => ({ ...simpleTileToTile(simpleBackTile), index: tile.index })

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
        [9, 7, 5, 3, 1].slice(0, state.wall.doraCount).includes(index) ? tile : hideTile(tile)
      ),
      supplementTiles: state.wall.supplementTiles.map(hideTile),
    },
  }
}

export const initState = (state: GameState) => {
  const tiles = availableTiles.slice()
  for (let i = tiles.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[rand]] = [tiles[rand], tiles[i]]
  }

  tiles.forEach((tile, index) => (tile.index = index))

  state.wall.kingTiles = tiles.splice(0, 14)
  state.wall.supplementTiles = []

  state.host.hand.closed = []
  state.host.hand.tsumo = undefined

  state.guest.hand.closed = []
  state.guest.hand.tsumo = undefined

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
