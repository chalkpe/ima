import { FC, useEffect, useMemo, useState } from 'react'
import { Box, Paper, Stack } from '@mui/material'
import Mahgen from '../tile/Mahgen'
import Tenpai from './Tenpai'
import { trpc } from '../../utils/trpc'
import { convertTileToCode, sortTiles } from '../../utils/tile'

import type { Hand } from '../../../../server/src/types/game'
import TileSet from '../tile/TileSet'

interface HandProps {
  hand: Hand
  me?: boolean
}

const Hand: FC<HandProps> = ({ hand, me }) => {
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])

  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined)

  const currentTenpai = useMemo(() => hand.tenpai.find((tenpai) => tenpai.giriTile === null), [hand.tenpai])
  const tedashiTenpai = useMemo(
    () => hand.tenpai.filter((tenpai) => hoveredIndex !== undefined && tenpai.giriTile?.index === hoveredIndex),
    [hand.tenpai, hoveredIndex]
  )
  const tsumogiriTenpai = useMemo(
    () => hand.tenpai.filter((tenpai) => tenpai.giriTile?.index === hand.tsumo?.index),
    [hand.tenpai, hand.tsumo?.index]
  )

  const { mutate: giri } = trpc.game.giri.useMutation()

  useEffect(() => {
    setHoveredIndex(undefined)
  }, [hand.tsumo])

  return (
    <>
      {currentTenpai && (
        <Paper
          sx={{
            opacity: 0.5,
            position: 'absolute',
            bottom: '28vmin',
            left: '8vmin',
            padding: '1vmin',
          }}
        >
          Tenpai
        </Paper>
      )}

      {tedashiTenpai.length > 0 && <Tenpai tenpaiList={tedashiTenpai} />}
      {tsumogiriTenpai.length > 0 && <Tenpai tenpaiList={tsumogiriTenpai} current />}

      <Stack
        direction={me ? 'row' : 'row-reverse'}
        gap="2vmin"
        position="absolute"
        {...(me ? { bottom: '2vmin', left: '8vmin' } : { top: '2vmin', right: '8vmin' })}
      >
        <Stack direction="row" gap={0} alignItems="end">
          {closed.map((tile) => (
            <Mahgen
              key={tile.index}
              size={5}
              sequence={convertTileToCode(tile)}
              onMouseEnter={() => me && setHoveredIndex(tile.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onClick={() => giri({ index: tile.index })}
              style={{ paddingBottom: hoveredIndex === tile.index ? '1vmin' : undefined }}
            />
          ))}
        </Stack>
        <Stack direction="row" gap={0} alignItems="end">
          {hand.tsumo ? (
            <Mahgen
              size={5}
              sequence={convertTileToCode(hand.tsumo)}
              onMouseEnter={() => me && setHoveredIndex(hand.tsumo!.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onClick={() => giri({ index: hand.tsumo!.index })}
              style={{ paddingBottom: hoveredIndex === hand.tsumo!.index ? '1vmin' : undefined }}
            />
          ) : (
            <Box width="5vmin" />
          )}
        </Stack>
      </Stack>

      <Stack
        direction="column-reverse"
        gap="0.5vmin"
        position="absolute"
        justifyContent="end"
        {...(me ? { bottom: '2vmin', right: '2vmin' } : { top: '2vmin', left: '2vmin' })}
        sx={me ? {} : { transform: 'rotate(180deg)' }}
      >
        {hand.called.map((tileSet, index) => (
          <TileSet
            tileSet={tileSet}
            size={5}
            key={index + tileSet.jun + tileSet.tiles.map(convertTileToCode).join('')}
          />
        ))}
      </Stack>
    </>
  )
}

export default Hand
