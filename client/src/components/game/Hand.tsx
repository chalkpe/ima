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

  return (<>
    <Stack
      direction={me ? 'row' : 'row-reverse'}
      gap="2vmin"
      position="absolute"
      {...(me ? { bottom: '2vmin', left: '8vmin' } : { top: '2vmin', right: '8vmin' })}
    >
      <Stack direction="row" gap={0}>
        {closed.map((tile) => (
          <Mahgen
            key={tile.type + tile.value + tile.index}
            size={5}
            sequence={convertTileToCode(tile)}
            onClick={() => mutate({ index: tile.index }, { onSuccess: () => utils.game.state.invalidate() })}
          />
        ))}
      </Stack>
      {hand.tsumo ? (
        <Mahgen
          size={5}
          sequence={convertTileToCode(hand.tsumo)}
          onClick={() => mutate({ index: -1 }, { onSuccess: () => utils.game.state.invalidate() })}
        />
      ) : (
        <Box width="5vmin" />
      )}
    </Stack>
    

      <Stack direction="column-reverse" gap="0.5vmin"
        position="absolute"
        {...(me ? { bottom: '2vmin', right: '2vmin' } : { top: '2vmin', left: '2vmin' })}
        sx={me ? {} : { transform: 'rotate(180deg)' }}
      >
      {hand.called.map((tileSet, index) => (
        <Stack key={tileSet.tiles[0].type + tileSet.tiles[0].value + index} direction="row" gap={0}>
          {tileSet.tiles.map((tile, index) => (
            <Mahgen key={tile.type + tile.value + index} size={5} sequence={convertTileToCode(tile)} />
          ))}
        </Stack>
      ))}

    </Stack>
    </>
  )
}

export default Hand
