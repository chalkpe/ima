import { useEffect } from 'react'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { CheckOutlined } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material'

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
        <div>
          <Stack direction="row" alignItems="center" gap="2vmin">
            <h1>방</h1>

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
          <p>
            방장: {data.host} {data.hostReady && <CheckOutlined />}
          </p>
          <p>
            상대: {data.guest} {data.guestReady && <CheckOutlined />}
          </p>

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
        </div>
      ) : (
        <p>방 정보를 불러오는 중...</p>
      )}
    </>
  )
}

export default Room
