import { FC, useEffect, useMemo, useState } from 'react'
import { Box, Paper, Stack } from '@mui/material'
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

  const utils = trpc.useUtils()
  const { mutate: giri } = trpc.game.giri.useMutation()

  useEffect(() => {
    setHoveredIndex(undefined)
  }, [hand.tsumo])

  return (
    <>
      {currentTenpai && (
        <Paper sx={{ position: 'absolute', bottom: '28vmin', left: '8vmin', padding: '1vmin' }}>Tenpai</Paper>
      )}

      {tedashiTenpai.length > 0 && <Tenpai tenpaiList={tedashiTenpai} />}
      {tsumogiriTenpai.length > 0 && <Tenpai tenpaiList={tsumogiriTenpai} current />}

      <Stack
        direction={me ? 'row' : 'row-reverse'}
        gap="2vmin"
        position="absolute"
        {...(me ? { bottom: '2vmin', left: '8vmin' } : { top: '2vmin', right: '8vmin' })}
      >
        <Stack direction="row" gap={0}>
          {closed.map((tile) => (
            <Mahgen
              key={tile.index}
              size={5}
              sequence={convertTileToCode(tile)}
              onMouseEnter={() => setHoveredIndex(tile.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onClick={() => giri({ index: tile.index }, { onSuccess: () => utils.game.state.invalidate() })}
              style={{ transform: hoveredIndex === tile.index ? 'translateY(-1vmin)' : undefined }}
            />
          ))}
        </Stack>
        {hand.tsumo ? (
          <Mahgen
            size={5}
            sequence={convertTileToCode(hand.tsumo)}
            onMouseEnter={() => setHoveredIndex(hand.tsumo!.index)}
            onMouseLeave={() => setHoveredIndex(undefined)}
            onClick={() => giri({ index: hand.tsumo!.index }, { onSuccess: () => utils.game.state.invalidate() })}
            style={{ transform: hoveredIndex === hand.tsumo!.index ? 'translateY(-1vmin)' : undefined }}
          />
        ) : (
          <Box width="5vmin" />
        )}
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
          <Stack
            key={tileSet.tiles[0].type + tileSet.tiles[0].value + index}
            direction="row"
            gap={0}
            alignItems="end"
            justifyContent="end"
          >
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
            ) : tileSet.type === 'gakan' ? (
              <>
                <Mahgen size={5} sequence={convertTileToCode(tileSet.tiles[1])} />
                <Stack direction="column">
                  <Mahgen size={5} sequence={'_' + convertTileToCode(tileSet.tiles[3])} />
                  <Mahgen size={5} sequence={'_' + convertTileToCode(tileSet.tiles[0])} />
                </Stack>
                <Mahgen size={5} sequence={convertTileToCode(tileSet.tiles[2])} />
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
            ) : tileSet.type === 'chi' ? (
              [tileSet.tiles[1], tileSet.tiles[0], tileSet.tiles[2]].map((tile, index) => (
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
