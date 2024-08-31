import { FC, useMemo, useState } from 'react'
import { Box, Stack } from '@mui/material'
import Mahgen from './Mahgen'
import Tenpai from './Tenpai'
import { trpc } from '../../utils/trpc'
import { convertTileToCode, sortTiles } from '../../utils/tile'

import type { Hand } from '../../../../server/src/types/game'

interface HandProps {
  hand: Hand
  me?: boolean
}

const Hand: FC<HandProps> = ({ hand, me }) => {
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])
  const [hovered, setHovered] = useState<number | undefined>(undefined)

  const utils = trpc.useUtils()
  const { mutate } = trpc.game.giri.useMutation()

  return (
    <>
      {hovered !== undefined && hand.tenpai[hovered] && <Tenpai tenpai={hand.tenpai[hovered]} />}

      <Stack
        direction={me ? 'row' : 'row-reverse'}
        gap="2vmin"
        position="absolute"
        {...(me ? { bottom: '2vmin', left: '8vmin' } : { top: '2vmin', right: '8vmin' })}
      >
        <Stack direction="row" gap={0}>
          {closed.map((tile) => (
            <Mahgen
              key={tile.type + tile.value + tile.order}
              size={5}
              sequence={convertTileToCode(tile)}
              onMouseEnter={() => setHovered(tile.order)}
              onMouseLeave={() => setHovered(undefined)}
              onClick={() => mutate({ index: tile.order }, { onSuccess: () => utils.game.state.invalidate() })}
              style={{ transform: hovered === tile.order ? 'translateY(-1vmin)' : undefined }}
            />
          ))}
        </Stack>
        {hand.tsumo ? (
          <Mahgen
            size={5}
            sequence={convertTileToCode(hand.tsumo)}
            onMouseEnter={() => setHovered(closed.length)}
            onMouseLeave={() => setHovered(undefined)}
            onClick={() => mutate({ index: -1 }, { onSuccess: () => utils.game.state.invalidate() })}
            style={{ transform: hovered === closed.length ? 'translateY(-1vmin)' : undefined }}
          />
        ) : (
          <Box width="5vmin" />
        )}
      </Stack>

      <Stack
        direction="column-reverse"
        gap="0.5vmin"
        position="absolute"
        justifyContent='end'
        {...(me ? { bottom: '2vmin', right: '2vmin' } : { top: '2vmin', left: '2vmin' })}
        sx={me ? {} : { transform: 'rotate(180deg)' }}
      >
        {hand.called.map((tileSet, index) => (
          <Stack key={tileSet.tiles[0].type + tileSet.tiles[0].value + index} direction="row" gap={0} alignItems="end" justifyContent="end">
            {tileSet.type === 'ankan' ? (
              <>
                <Mahgen size={5} sequence="0z" />
                <Mahgen
                  size={5}
                  sequence={convertTileToCode(
                    tileSet.tiles.find((tile) => tile.attribute === 'red') ?? tileSet.tiles[0]
                  )}
                />
                <Mahgen
                  size={5}
                  sequence={convertTileToCode(
                    tileSet.tiles.find((tile) => tile.attribute !== 'red') ?? tileSet.tiles[1]
                  )}
                />
                <Mahgen size={5} sequence="0z" />
              </>
            ) : tileSet.type === 'pon' ? (
              [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2]].map((tile, index) => (
                <Mahgen
                  key={tile.type + tile.value + index}
                  size={5}
                  sequence={(index === 1 ? '_' : '') + convertTileToCode(tile)}
                />
              ))
            ) : tileSet.type === 'daiminkan' ? (
              [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2], tileSet.tiles[3]].map((tile, index) => (
                <Mahgen
                  key={tile.type + tile.value + index}
                  size={5}
                  sequence={(index === 1 ? '_' : '') + convertTileToCode(tile)}
                />
              ))
            ) : (
              tileSet.tiles.map((tile, index) => (
                <Mahgen key={tile.type + tile.value + index} size={5} sequence={convertTileToCode(tile)} />
              ))
            )}
          </Stack>
        ))}
      </Stack>
    </>
  )
}

export default Hand
