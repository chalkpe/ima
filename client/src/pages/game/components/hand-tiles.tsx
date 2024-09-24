import { FC, useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import Hai from '@ima/client/components/hai'
import HaiGroup from '@ima/client/components/hai-group'
import TenpaiTiles from '@ima/client/pages/game/components/tenpai-tiles'
import TenpaiLabel from '@ima/client/pages/game/components/tenpai-label'
import { trpc } from '@ima/client/utils/trpc'
import { sortTiles } from '@ima/client/utils/tile'
import { useAtom } from 'jotai'
import { hoveredAtom } from '@ima/client/store/hovered'
import type { Hand } from '@ima/server/types/game'

interface HandTilesProps {
  hand: Hand
  me?: boolean
  turn?: boolean
}

const HandTiles: FC<HandTilesProps> = ({ hand, me, turn }) => {
  const [hoveredIndex, setHoveredIndex] = useAtom(hoveredAtom)
  const closed = useMemo(() => sortTiles(hand.closed), [hand.closed])

  const currentTenpai = useMemo(() => hand.tenpai.filter((tenpai) => tenpai.giriTile === null), [hand.tenpai])
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
      {tedashiTenpai.length === 0 && currentTenpai.length > 0 && <TenpaiLabel list={currentTenpai} />}
      {tedashiTenpai.length > 0 && <TenpaiTiles list={tedashiTenpai} />}
      {tsumogiriTenpai.length > 0 && <TenpaiTiles list={tsumogiriTenpai} current />}

      <Stack
        direction={me ? 'row' : 'row-reverse'}
        gap="2vmin"
        position="absolute"
        {...(me ? { bottom: '2vmin', left: '2vmin' } : { top: '2vmin', right: '2vmin' })}
      >
        <Stack direction={me ? 'row' : 'row-reverse'} gap={0} alignItems="end">
          {closed.map((tile) => (
            <Hai
              key={tile.index}
              size={6}
              tile={tile}
              onClick={() => me && setHoveredIndex(tile.index)}
              onMouseEnter={() => me && setHoveredIndex(tile.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onDoubleClick={() => me && hoveredIndex === tile.index && giri({ index: tile.index })}
              style={{
                paddingBottom: hoveredIndex === tile.index ? '1vmin' : '0',
                cursor: hand.banned.includes(tile.index) ? 'not-allowed' : me && turn ? 'pointer' : 'default',
              }}
              animate
              dim={hand.banned.includes(tile.index)}
            />
          ))}
        </Stack>
        <Stack direction="row" gap={0} alignItems="end">
          {hand.tsumo ? (
            <Hai
              key={hand.tsumo.index}
              size={6}
              tile={hand.tsumo}
              onClick={() => me && hand.tsumo && setHoveredIndex(hand.tsumo.index)}
              onMouseEnter={() => me && hand.tsumo && setHoveredIndex(hand.tsumo.index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
              onDoubleClick={() =>
                me && hand.tsumo && hoveredIndex === hand.tsumo.index && giri({ index: hand.tsumo.index })
              }
              style={{
                paddingBottom: hoveredIndex === hand.tsumo.index ? '1vmin' : '0',
                cursor: me && turn ? 'pointer' : 'default',
              }}
              animate
            />
          ) : (
            <Box width="6vmin" />
          )}
        </Stack>
      </Stack>

      <Stack
        direction={me ? 'column-reverse' : 'column'}
        gap="0.5vmin"
        position="absolute"
        justifyContent="end"
        {...(me ? { bottom: '2vmin', right: '2vmin' } : { top: '2vmin', left: '2vmin' })}
      >
        {hand.called.map((set) => (
          <HaiGroup
            animate
            flip={!me}
            set={set}
            size={5}
            key={[set.type, set.jun, set.tiles.map((t) => t.index).join()].join()}
          />
        ))}
      </Stack>
    </>
  )
}

export default HandTiles
