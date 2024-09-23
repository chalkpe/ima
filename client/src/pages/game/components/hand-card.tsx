import { FC } from 'react'
import { Stack } from '@mui/material'
import Hai from '@ima/client/components/hai'
import HaiGroup from '@ima/client/components/hai-group'
import { compareTile } from '@ima/client/utils/tile'
import { getAgariHaiSize } from '@ima/client/utils/game'
import type { Hand } from '@ima/server/types/game'

interface HandCardProps {
  hand: Hand
}

const HandCard: FC<HandCardProps> = ({ hand }) => {
  return (
    <Stack direction="row" gap="1vmin">
      <Stack direction="row" gap={0}>
        {[...hand.closed].sort(compareTile).map((tile) => (
          <Hai key={tile.index} size={getAgariHaiSize(hand)} tile={tile} />
        ))}
      </Stack>
      <Stack direction="row" gap="0.5vmin">
        {hand.called.map((set) => (
          <HaiGroup
            key={[set.type, set.jun, set.tiles.map((t) => t.index).join()].join()}
            set={set}
            size={getAgariHaiSize(hand)}
            rotate={false}
            stack={false}
          />
        ))}
      </Stack>
      {hand.tsumo && <Hai size={getAgariHaiSize(hand)} tile={hand.tsumo} />}
    </Stack>
  )
}

export default HandCard
