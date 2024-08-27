import { FC, useMemo } from 'react'
import type { Hand } from '../../../../server/src/db'
import { convertTileToCode, sortTiles } from '../../utils/tile'
import Mahgen from './Mahgen'
import { Box, Stack } from '@mui/material'
import { trpc } from '../../utils/trpc'

interface HandProps {
  hand: Hand
  me?: boolean
}

const Hand: FC<HandProps> = ({ hand, me }) => {
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])

  const utils = trpc.useUtils()
  const { mutate } = trpc.game.giri.useMutation()

  return (
    <Stack
      direction={me ? 'row' : 'row-reverse'}
      gap="2vmin"
      width="100%"
      justifyContent="center"
      position="absolute"
      {...(me ? { bottom: '2vmin' } : { top: '2vmin' })}
    >
      <Stack direction="row" gap={0}>
        {closed.map((tile) => (
          <Mahgen
            key={tile.type + tile.value + tile.index}
            size={6}
            sequence={convertTileToCode(tile)}
            onClick={() => mutate({ index: tile.index }, { onSuccess: () => utils.game.state.invalidate() })}
          />
        ))}
      </Stack>
      {hand.tsumo ? (
        <Mahgen
          size={6}
          sequence={convertTileToCode(hand.tsumo)}
          onClick={() => mutate({ index: -1 }, { onSuccess: () => utils.game.state.invalidate() })}
        />
      ) : (
        <Box width="6vmin" />
      )}
    </Stack>
  )
}

export default Hand
