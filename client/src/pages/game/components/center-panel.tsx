import { FC } from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import { getWindCode, getWindName } from '@ima/client/utils/game'
import type { Room, PlayerType } from '@ima/server/types/game'

interface CenterPanelProps {
  room: Room
  me: PlayerType
}

const CenterPanel: FC<CenterPanelProps> = ({ room, me }) => {
  const theme = useTheme()
  const tileSuffix = theme.palette.mode === 'dark' ? 'd' : ''

  const op = me === 'host' ? 'guest' : 'host'
  const meColor = room[`${me}User`]?.preference?.riichiStick.toLowerCase() ?? 'red'
  const opColor = room[`${op}User`]?.preference?.riichiStick.toLowerCase() ?? 'red'

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: '40vmin',
        left: '32.5vmin',
        width: '35vmin',
        height: '20vmin',
        userSelect: 'none',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        position="absolute"
        width="5vmin"
        height="5vmin"
        {...(room.state.turn === me ? { bottom: '1.5vmin', right: '1.5vmin' } : { top: '1.5vmin', left: '1.5vmin' })}
        sx={{ backgroundColor: '#ef5172' }}
      />

      <img
        src={`/center/center_${theme.palette.mode}.png`}
        alt="center"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      />

      <Box position="relative" width="100%" height="100%">
        <Box
          position="absolute"
          left="1.5vmin"
          right="calc(100% - 9.6vmin)"
          top="calc(50% - 2.5vmin)"
          bottom="calc(50% - 2.5vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.5vmin" fontWeight="bold">
            {getWindName(room.state.round.wind)}
            {room.state.round.kyoku}국
          </Typography>
        </Box>

        <Box
          position="absolute"
          left="calc(50% - 3.75vmin)"
          right="calc(50% - 0.1vmin)"
          top="calc(50% - 2.5vmin)"
          bottom="calc(50% + 0.15vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.25vmin" fontWeight="bold">
            {room.state.round.riichiSticks}
          </Typography>
        </Box>

        <Box
          position="absolute"
          left="calc(50% - 3.75vmin)"
          right="calc(50% - 0.1vmin)"
          top="calc(50% + 0.15vmin)"
          bottom="calc(50% - 2.5vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.25vmin" fontWeight="bold">
            {room.state.round.honba}
          </Typography>
        </Box>

        <Box
          position="absolute"
          left="calc(50% + 1vmin)"
          right="1.7vmin"
          top="calc(50% - 2.5vmin)"
          bottom="calc(50% - 2.5vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="3vmin" fontWeight="bold">
            {room.state.wall.tiles.length}/40
          </Typography>
        </Box>

        <Box
          position="absolute"
          top="1.3vmin"
          right="1.5vmin"
          width="5.25vmin"
          height="5.25vmin"
          padding="0.5vmin"
          sx={{
            backgroundOrigin: 'content-box',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(/tiles/${getWindCode(room.state[op].wind)}${tileSuffix}.png)`,
            transform: 'rotate(180deg)',
          }}
        />

        <Box
          position="absolute"
          left="7.25vmin"
          right="8.15vmin"
          top="3.85vmin"
          bottom="calc(100% - 6.5vmin)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.25vmin" fontWeight="bold" letterSpacing="0.2vmin">
            {room.state[op].score}
          </Typography>
        </Box>

        {room.state[op].riichi !== null && (
          <Box
            position="absolute"
            right="8.2vmin"
            top="1.5vmin"
            width="19.5vmin"
            height="1.95vmin"
            sx={{
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundImage: `url(/center/riichi_stick_${opColor}.png)`,
              transform: 'rotate(180deg)',
            }}
          />
        )}

        <Box
          position="absolute"
          bottom="1.3vmin"
          left="1.5vmin"
          width="5.25vmin"
          height="5.25vmin"
          padding="0.5vmin"
          sx={{
            backgroundOrigin: 'content-box',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(/tiles/${getWindCode(room.state[me].wind)}${tileSuffix}.png)`,
          }}
        />

        <Box
          position="absolute"
          left="8.15vmin"
          right="7.25vmin"
          top="calc(100% - 6.5vmin)"
          bottom="3.85vmin"
          display="flex"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Typography fontSize="2.25vmin" fontWeight="bold" letterSpacing="0.2vmin">
            {room.state[me].score}
          </Typography>
        </Box>

        {room.state[me].riichi !== null && (
          <Box
            position="absolute"
            left="8.2vmin"
            bottom="1.5vmin"
            width="19.5vmin"
            height="1.95vmin"
            sx={{
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundImage: `url(/center/riichi_stick_${meColor}.png)`,
            }}
          />
        )}
      </Box>
    </Paper>
  )
}

export default CenterPanel
