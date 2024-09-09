import { FC, useMemo } from 'react'
import { Box, Paper, Stack } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import Tenpai from '@ima/client/components/game/Tenpai'
import { trpc } from '@ima/client/utils/trpc'
import { convertTileToCode, sortTiles } from '@ima/client/utils/tile'

import type { Hand } from '@ima/server/types/game'
import TileSet from '@ima/client/components/tile/TileSet'
import { useAtom } from 'jotai'
import { hoveredAtom } from '@ima/client/store/hovered'

interface HandProps {
  hand: Hand
  me?: boolean
}

const Hand: FC<HandProps> = ({ hand, me }) => {
  const [hoveredIndex, setHoveredIndex] = useAtom(hoveredAtom)
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])

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
              tile={tile}
              onClick={() => me && setHoveredIndex(tile.index)}
              onMouseEnter={() => me && setHoveredIndex(tile.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onDoubleClick={() => me && hoveredIndex === tile.index && giri({ index: tile.index })}
              style={{ paddingBottom: hoveredIndex === tile.index ? '1vmin' : '0' }}
              dim={hand.banned.includes(tile.index)}
            />
          ))}
        </Stack>
        <Stack direction="row" gap={0} alignItems="end">
          {hand.tsumo ? (
            <Mahgen
              size={5}
              tile={hand.tsumo}
              onClick={() => me && setHoveredIndex(hand.tsumo!.index)}
              onMouseEnter={() => me && setHoveredIndex(hand.tsumo!.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onDoubleClick={() => me && hoveredIndex === hand.tsumo!.index && giri({ index: hand.tsumo!.index })}
              style={{ paddingBottom: hoveredIndex === hand.tsumo!.index ? '1vmin' : '0' }}
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
