import { FC } from 'react'
import Hai from '@ima/client/components/hai'
import { Box } from '@mui/material'
import { chunk, compareSimpleTile } from '@ima/client/utils/tile'
import { useAtomValue } from 'jotai'
import { hoveredAtom } from '@ima/client/store/hovered'
import type { RiverTile } from '@ima/server/types/game'

interface RiverTilesProps {
  river: RiverTile[]
  me?: boolean
}

const RiverTiles: FC<RiverTilesProps> = ({ river, me }) => {
  const hovered = useAtomValue(hoveredAtom)

  return (
    <Box
      sx={{
        position: 'absolute',
        ...(me ? { left: '32.5vmin' } : { right: '32.5vmin' }),
        ...(me ? { top: '60.25vmin' } : { bottom: '60.25vmin' }),
        display: 'flex',
        flexDirection: me ? 'column' : 'column-reverse',
        justifyContent: 'start',
        gap: '0.2vmin',
      }}
    >
      {chunk(river, [6, 6, Infinity]).map((line) => (
        <Box
          key={line.map((t) => t.tile.index).join()}
          sx={{ display: 'flex', flexFlow: me ? 'row' : 'row-reverse', gap: '0.1vmin' }}
        >
          {line.map((riverTile) => (
            <Hai
              key={riverTile.tile.index}
              size={5}
              natural
              rotate={riverTile.isRiichi}
              dim={riverTile.isTsumogiri}
              tile={riverTile.tile}
              animate
              flip={!me}
              selected={hovered && compareSimpleTile(riverTile.tile, hovered) === 0}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default RiverTiles
