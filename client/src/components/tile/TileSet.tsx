import { FC } from 'react'
import { Stack } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import { backTile, reorderCalledTiles } from '@ima/client/utils/tile'
import type { TileSet } from '@ima/server/types/game'

const attributeOrder = ['red', 'normal'] as const
const backgroundOrder = ['transparent', 'white'] as const

interface TileSetProps {
  tileSet: TileSet
  size: number
  rotate?: boolean
  stack?: boolean
}

const TileSet: FC<TileSetProps> = ({ tileSet, size, rotate = true, stack = true }) => {
  return (
    <Stack direction="row" gap={0} alignItems="end" justifyContent="end">
      {tileSet.type === 'ankan' ? (
        <>
          <Mahgen size={size} tile={backTile} />
          {[...tileSet.tiles]
            .sort(
              (a, b) =>
                attributeOrder.indexOf(a.attribute) - attributeOrder.indexOf(b.attribute) ||
                backgroundOrder.indexOf(a.background) - backgroundOrder.indexOf(b.background) ||
                a.index - b.index
            )
            .slice(0, 2)
            .map((tile) => (
              <Mahgen key={tile.index} size={size} tile={tile} />
            ))}
          <Mahgen size={size} tile={backTile} />
        </>
      ) : tileSet.type === 'gakan' ? (
        <>
          <Mahgen size={size} tile={tileSet.tiles[1]} />
          {stack ? (
            <Stack direction="column">
              <Mahgen size={size} rotate={rotate} stack tile={tileSet.tiles[3]} />
              <Mahgen size={size} rotate={rotate} tile={tileSet.tiles[0]} />
            </Stack>
          ) : (
            <>
              <Mahgen size={size} rotate={rotate} tile={tileSet.tiles[0]} />
              <Mahgen size={size} rotate={rotate} tile={tileSet.tiles[3]} />
            </>
          )}
          <Mahgen size={size} tile={tileSet.tiles[2]} />
        </>
      ) : tileSet.type === 'pon' ? (
        reorderCalledTiles(tileSet).map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} rotate={index === 1 && rotate} tile={tile} />
        ))
      ) : tileSet.type === 'daiminkan' ? (
        reorderCalledTiles(tileSet).map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} rotate={index === 1 && rotate} tile={tile} />
        ))
      ) : tileSet.type === 'chi' ? (
        reorderCalledTiles(tileSet).map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} rotate={index === 1 && rotate} tile={tile} />
        ))
      ) : (
        tileSet.tiles.map((tile, index) => <Mahgen key={tile.type + tile.value + index} size={size} tile={tile} />)
      )}
    </Stack>
  )
}

export default TileSet
