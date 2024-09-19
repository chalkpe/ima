import { FC } from 'react'
import { Stack, Typography } from '@mui/material'
import Hai from '@ima/client/components/hai'
import HaiGroup from '@ima/client/components/hai-group'
import { calculateScoreName } from '@ima/client/utils/game'
import { compareTile } from '@ima/client/utils/tile'
import type { AgariScoreboard, Room } from '@ima/server/types/game'
import { WiredCard } from 'react-wired-elements'

interface GameResultAgariProps {
  room: Room
  scoreboard: AgariScoreboard
}

const GameResultAgari: FC<GameResultAgariProps> = ({ room, scoreboard }) => {
  const winner = room[`${scoreboard.winner}User`]

  return (
    <>
      <Typography fontSize="6vmin" fontWeight="bold">
        {winner?.displayName} {scoreboard.agariType === 'tsumo' ? '쯔모' : '론'}
      </Typography>

      <WiredCard elevation={3} style={{ backgroundColor: '#cadf9f' }}>
        <Stack direction="column" gap="2vmin" padding="1.5vmin" borderRadius="1vmin">
          <Stack direction="row" gap="1vmin">
            <Stack direction="row" gap={0}>
              {[...scoreboard.hand.closed].sort(compareTile).map((tile) => (
                <Hai key={tile.index} size={3.5} tile={tile} />
              ))}
            </Stack>
            <Stack direction="row" gap="0.5vmin">
              {scoreboard.hand.called.map((set) => (
                <HaiGroup
                  key={[set.type, set.jun, set.tiles.map((t) => t.index).join()].join()}
                  set={set}
                  size={3.5}
                  rotate={false}
                  stack={false}
                />
              ))}
            </Stack>
            {scoreboard.hand.tsumo && <Hai size={3.5} tile={scoreboard.hand.tsumo} />}
          </Stack>

          <Stack direction="row" gap="1vmin">
            <Stack direction="row" gap="1vmin">
              <Typography fontSize="3vmin">도라</Typography>
              <Stack direction="row">
                {scoreboard.doraTiles.map((tile) => (
                  <Hai key={tile.index} size={3.5} tile={tile} />
                ))}
              </Stack>
            </Stack>
            <Stack direction="row" gap="1vmin">
              <Typography fontSize="3vmin">뒷도라</Typography>
              <Stack direction="row">
                {scoreboard.uraDoraTiles.map((tile) => (
                  <Hai key={tile.index} size={3.5} tile={tile} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </WiredCard>

      <Stack direction="row" flexWrap="wrap" gap="1vmin">
        {scoreboard.yaku.map((yaku) => (
          <WiredCard key={yaku.name} elevation={1} style={{ backgroundColor: yaku.isYakuman ? '#fac12d' : '#ccc' }}>
            <Stack direction="row" gap="1vmin" sx={{ padding: '0 1vmin' }}>
              <Typography fontSize="3vmin" fontWeight="bold">
                {yaku.name}
              </Typography>
              <Typography fontSize="3vmin">{yaku.han}판</Typography>
            </Stack>
          </WiredCard>
        ))}
      </Stack>

      <Stack direction="row" gap="2vmin" flex="1">
        <Typography fontSize="5vmin" fontWeight="bold">
          {calculateScoreName(scoreboard)}
        </Typography>
        <Typography fontSize="5vmin" fontWeight="bold">
          {scoreboard.score}점
        </Typography>
      </Stack>
    </>
  )
}

export default GameResultAgari
