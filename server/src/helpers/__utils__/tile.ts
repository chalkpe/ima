import { codeSyntaxToHand } from '@ima/server/helpers/code'
import { simpleTileToRiverTile, simpleTileToTile } from '@ima/server/helpers/tile'

let index = 1 //Date.now()

export const c = (code: string) =>
  codeSyntaxToHand(code)
    .map(simpleTileToTile)
    .map((tile) => ({ ...tile, index: index++ }))

export const r = (tiles: string) =>
  codeSyntaxToHand(tiles)
    .map(simpleTileToRiverTile)
    .map((river) => ({ ...river, tile: { ...river.tile, index: index++ } }))
