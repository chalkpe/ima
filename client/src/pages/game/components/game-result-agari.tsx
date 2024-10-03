import { FC } from 'react'
import { Stack, Typography } from '@mui/material'
import Hai from '@ima/client/components/hai'
import SketchBox from '@ima/client/components/sketch-box'
import HandCard from '@ima/client/pages/game/components/hand-card'
import { calculateScoreName, getYakuFontSize } from '@ima/client/utils/game'
import type { AgariScoreboard, Room } from '@ima/server/types/game'
import UserHandle from '@ima/client/components/user-handle'

interface GameResultAgariProps {
  room: Room
  scoreboard: AgariScoreboard
}

const GameResultAgari: FC<GameResultAgariProps> = ({ room, scoreboard }) => {
  const winner = room[`${scoreboard.winner}User`]

  return (
    <>
      <Stack direction="row" gap="1vmin">
        {winner && (
          <UserHandle
            user={winner}
            fontSize={6}
            fontWeight="bold"
            style={{ maxWidth: '48vmin', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          />
        )}
        <Typography fontSize="6vmin" fontWeight="bold">
          {scoreboard.agariType === 'tsumo' ? '쯔모' : '론'}
        </Typography>
      </Stack>

      <SketchBox style={{ backgroundColor: '#cadf9f' }}>
        <Stack direction="column" gap="2vmin" padding="1.5vmin">
          <HandCard hand={scoreboard.hand} />
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
      </SketchBox>

      <Stack direction="row" flexWrap="wrap" gap="1vmin">
        {scoreboard.yaku.map((yaku, index, array) => (
          <SketchBox key={yaku.name} style={{ backgroundColor: yaku.isYakuman ? '#fac12d' : '#ccc' }}>
            <Stack direction="row" gap="1vmin" sx={{ padding: '0 1vmin' }}>
              <Typography fontSize={getYakuFontSize(yaku, index, array)} fontWeight="bold">
                {yaku.name}
              </Typography>
              <Typography fontSize={getYakuFontSize(yaku, index, array)}>{yaku.han}판</Typography>
            </Stack>
          </SketchBox>
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
