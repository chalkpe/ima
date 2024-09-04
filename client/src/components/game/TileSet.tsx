import { FC } from 'react'
import { Stack } from '@mui/material'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'
import type { TileSet } from '../../../../server/src/types/game'

interface TileSetProps {
  tileSet: TileSet
  size: number
  rotate?: boolean
}

const TileSet: FC<TileSetProps> = ({ tileSet, size, rotate = true }) => {

  const rotatePrefix = rotate ? '_' : ''

  return (
    <Stack direction="row" gap={0} alignItems="end" justifyContent="end">
      {tileSet.type === 'ankan' ? (
        <>
          <Mahgen size={size} sequence="0z" />
          <Mahgen
            size={size}
            sequence={convertTileToCode(tileSet.tiles.find((tile) => tile.attribute === 'red') ?? tileSet.tiles[0])}
          />
          <Mahgen
            size={size}
            sequence={convertTileToCode(tileSet.tiles.find((tile) => tile.attribute !== 'red') ?? tileSet.tiles[1])}
          />
          <Mahgen size={size} sequence="0z" />
        </>
      ) : tileSet.type === 'gakan' ? (
        <>
          <Mahgen size={size} sequence={convertTileToCode(tileSet.tiles[1])} />
          <Stack direction="column">
            <Mahgen size={size} sequence={rotatePrefix + convertTileToCode(tileSet.tiles[3])} />
            <Mahgen size={size} sequence={rotatePrefix + convertTileToCode(tileSet.tiles[0])} />
          </Stack>
          <Mahgen size={size} sequence={convertTileToCode(tileSet.tiles[2])} />
        </>
      ) : tileSet.type === 'pon' ? (
        [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2]].map((tile, index) => (
          <Mahgen
            key={tile.type + tile.value + index}
            size={size}
            sequence={(index === 1 ? rotatePrefix : '') + convertTileToCode(tile)}
          />
        ))
      ) : tileSet.type === 'daiminkan' ? (
        [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2], tileSet.tiles[3]].map((tile, index) => (
          <Mahgen
            key={tile.type + tile.value + index}
            size={size}
            sequence={(index === 1 ? rotatePrefix : '') + convertTileToCode(tile)}
          />
        ))
      ) : tileSet.type === 'chi' ? (
        [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2]].map((tile, index) => (
          <Mahgen
            key={tile.type + tile.value + index}
            size={size}
            sequence={(index === 1 ? rotatePrefix : '') + convertTileToCode(tile)}
          />
        ))
      ) : (
        tileSet.tiles.map((tile, index) => (
          <Mahgen key={tile.type + tile.value + index} size={size} sequence={convertTileToCode(tile)} />
        ))
      )}
    </Stack>
  )
}

export default TileSet
