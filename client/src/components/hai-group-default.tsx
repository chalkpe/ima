import { FC } from 'react'
import Hai from '@ima/client/components/hai'
import { reorderCalledTiles } from '@ima/client/utils/tile'
import type { TileSet } from '@ima/server/types/game'

interface HaiGroupDefaultProps {
  set: TileSet
  size: number
  rotate?: boolean
}

const HaiGroupDefault: FC<HaiGroupDefaultProps> = ({ set, size, rotate }) => {
  return reorderCalledTiles(set).map((tile, index) => (
    <Hai key={tile.index} size={size} rotate={index === 1 && rotate} tile={tile} />
  ))
}

export default HaiGroupDefault
