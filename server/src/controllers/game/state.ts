import { simpleTileToTile } from '../../helpers/tile'
import { backTile as simpleBackTile } from '../../helpers/code'
import { availableTiles, haipaiCounts } from '../../helpers/game'
import type { GameState, PlayerType } from '../../types/game'

export const getVisibleState = (state: GameState, playerType: PlayerType): GameState => {
  const opponent = playerType === 'host' ? 'guest' : 'host'
  const backTile = simpleTileToTile(simpleBackTile)

  return {
    ...state,
    [opponent]: {
      ...state[opponent],
      hand: {
        ...state[opponent].hand,
        closed: state[opponent].hand.closed.map(() => backTile),
        tsumo: state[opponent].hand.tsumo ? backTile : undefined,
        tenpai: [],
      },
      decisions: [],
    },
    wall: {
      ...state.wall,
      tiles: state.wall.tiles.map((tile) => ({ ...backTile, index: tile.index })),
      kingTiles: state.wall.kingTiles.map((tile, index) =>
        [9, 7, 5, 3, 1].slice(0, state.wall.doraCount).includes(index) ? tile : backTile
      ),
      supplementTiles: state.wall.supplementTiles.map(() => backTile),
    },
  }
}

export const initState = (state: GameState) => {
  const tiles = availableTiles.slice() //.filter((tile) => tile.type !== 'man' || tile.value !== 1)
  for (let i = tiles.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[rand]] = [tiles[rand], tiles[i]]
  }

  tiles.forEach((tile, index) => (tile.index = index))

  state.wall.kingTiles = tiles.splice(0, 14)
  state.wall.supplementTiles = []

  state.host.hand.closed = []
  state.guest.hand.closed = []

  haipaiCounts.forEach((count) => {
    state.host.hand.closed.push(...tiles.splice(0, count))
    state.guest.hand.closed.push(...tiles.splice(0, count))
  })

  // state.host.hand.closed[0].type = 'man'
  // state.host.hand.closed[0].value = 1
  // state.host.hand.closed[1].type = 'man'
  // state.host.hand.closed[1].value = 1
  // state.host.hand.closed[2].type = 'man'
  // state.host.hand.closed[2].value = 1
  // state.host.hand.closed[3].type = 'man'
  // state.host.hand.closed[3].value = 1

  // state.guest.hand.closed.forEach((tile, index) => {
  //   tile.type = kokushiTiles[Math.min(index + 1, kokushiTiles.length - 1)].type
  //   tile.value = kokushiTiles[Math.min(index + 1, kokushiTiles.length - 1)].value
  // })

  state.wall.tiles = tiles
  state.wall.firstTileIndex = tiles[0].index
  state.wall.lastTileIndex = tiles[tiles.length - 1].index
}
