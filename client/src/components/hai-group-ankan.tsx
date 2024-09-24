import { FC } from 'react'
import Hai from '@ima/client/components/hai'
import { ankanAttributeOrder, ankanBackgroundOrder, backTile } from '@ima/client/utils/tile'
import type { TileSet } from '@ima/server/types/game'

interface HaiGroupAnkanProps {
  set: TileSet
  size: number
  flip?: boolean
  animate?: boolean
}

const HaiGroupAnkan: FC<HaiGroupAnkanProps> = ({ set, size, flip, animate }) => {
  return (
    <>
      <Hai size={size} tile={backTile} />
      {[...set.tiles]
        .sort(
          (a, b) =>
            ankanAttributeOrder.indexOf(a.attribute) - ankanAttributeOrder.indexOf(b.attribute) ||
            ankanBackgroundOrder.indexOf(a.background) - ankanBackgroundOrder.indexOf(b.background) ||
            a.index - b.index
        )
        .slice(0, 2)
        .map((tile) => (
          <Hai key={tile.index} size={size} tile={tile} animate={animate} flip={flip} />
        ))}
      <Hai size={size} tile={backTile} />
    </>
  )
}

export default HaiGroupAnkan
