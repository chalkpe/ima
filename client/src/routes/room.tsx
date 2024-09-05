import { useEffect } from 'react'
import { trpc } from '@ima/client/utils/trpc'
import { useNavigate } from 'react-router-dom'
import useAuth from '@ima/client/hooks/useAuth'
import { CheckOutlined } from '@mui/icons-material'
import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material'

const Room = () => {
  const navigate = useNavigate()
  const { username, skip } = useAuth()

  const utils = trpc.useUtils()
  const { data, error } = trpc.lobby.room.useQuery(skip, { refetchInterval: 1000 })
  const { mutate: leave } = trpc.lobby.leave.useMutation({ onSuccess: () => utils.lobby.room.reset() })
  const { mutate: ready } = trpc.lobby.ready.useMutation({ onSuccess: () => utils.lobby.room.invalidate() })
  const { mutate: start } = trpc.game.start.useMutation({ onSuccess: () => utils.lobby.room.invalidate() })

  useEffect(() => {
    if (!data || error) {
      navigate('/lobby')
    } else if (data?.started) {
      navigate('/game')
    }
  }, [data, error, navigate])

  return (
    <>
      {data ? (
        <Stack direction="column" gap="2vmin">
          <Stack direction="row" alignItems="center" gap="2vmin">
            <Typography fontSize="3vmin" fontWeight="bold">
              방
            </Typography>

            <Button
              variant="contained"
              color="warning"
              disabled={data.host === username ? data.hostReady : data.guestReady}
              onClick={() => leave()}
            >
              나가기
            </Button>

            {data.host === username && (
              <Button
                variant="contained"
                disabled={!data.hostReady || !data.guestReady}
                onClick={() => start(undefined, { onSuccess: () => navigate('/game') })}
              >
                게임 시작
              </Button>
            )}
          </Stack>

          <div>
            <Stack direction="row" sx={{ fontSize: '2vmin' }} alignItems="center" gap="1vmin">
              <span>방장: {data.host}</span>
              {data.host !== '' ? (
                data.hostReady ? (
                  <CheckOutlined sx={{ width: '2vmin ' }} />
                ) : (
                  <CircularProgress size="2vmin" />
                )
              ) : (
                ''
              )}
            </Stack>
            <Stack direction="row" sx={{ fontSize: '2vmin' }} alignItems="center" gap="1vmin">
              <span>상대: {data.guest}</span>
              {data.guest !== '' ? (
                data.guestReady ? (
                  <CheckOutlined sx={{ width: '2vmin ' }} />
                ) : (
                  <CircularProgress size="2vmin" />
                )
              ) : (
                ''
              )}
            </Stack>
          </div>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.host === username ? data.hostReady : data.guestReady}
                  onChange={(e) => ready({ ready: e.target.checked })}
                />
              }
              label="준비"
            />
          </FormGroup>
        </Stack>
      ) : (
        <p>방 정보를 불러오는 중...</p>
      )}
    </>
  )
}

export default Room
