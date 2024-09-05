import { FC } from 'react'
import { Stack } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import { backTile } from '@ima/client/utils/tile'
import type { TileSet } from '@ima/server/types/game'

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
          <Mahgen size={size} tile={tileSet.tiles.find((tile) => tile.attribute === 'red') ?? tileSet.tiles[0]} />
          <Mahgen size={size} tile={tileSet.tiles.find((tile) => tile.attribute !== 'red') ?? tileSet.tiles[1]} />
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
        [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2]].map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} rotate={index === 1 && rotate} tile={tile} />
        ))
      ) : tileSet.type === 'daiminkan' ? (
        [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2], tileSet.tiles[3]].map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} rotate={index === 1 && rotate} tile={tile} />
        ))
      ) : tileSet.type === 'chi' ? (
        [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2]].map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} rotate={index === 1 && rotate} tile={tile} />
        ))
      ) : (
        tileSet.tiles.map((tile, index) => <Mahgen key={tile.type + tile.value + index} size={size} tile={tile} />)
      )}
    </Stack>
  )
}

export default TileSet
