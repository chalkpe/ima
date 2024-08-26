import { FC, useMemo } from 'react'
import type { Hand } from '../../../server/src/db'
import { convertTileToCode, sortTiles } from '../utils/tile'
import Mahgen from './Mahgen'
import { Stack } from '@mui/material'
import { trpc } from '../utils/trpc'

interface HandProps {
  hand: Hand
  me?: boolean
}

const Hand: FC<HandProps> = ({ hand }) => {
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])

  const utils = trpc.useUtils()
  const { mutate } = trpc.game.giri.useMutation()

  return (
    <Stack direction="row" gap={4}>
      <Stack direction="row" gap={0}>
        {closed.map((tile) => (
          <Mahgen
            key={tile.type + tile.value + tile.index}
            sequence={convertTileToCode(tile)}
            onClick={() => mutate({ index: tile.index }, { onSuccess: () => utils.game.state.invalidate() })}
          />
        ))}
      </Stack>
      {hand.tsumo && (
        <Mahgen
          sequence={convertTileToCode(hand.tsumo)}
          onClick={() => mutate({ index: -1 }, { onSuccess: () => utils.game.state.invalidate() })}
        />
      )}
    </Stack>
  )
}

export default Hand
