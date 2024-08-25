import { useEffect } from 'react'
import { trpc } from '../utils/trpc'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { CheckOutlined } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { useAtomValue } from 'jotai'
import { usernameAtom } from '../store/username'

const Room = () => {
  const navigate = useNavigate()
  const username = useAtomValue(usernameAtom)

  const skip = useAuth()
  const { data, error, refetch } = trpc.lobby.room.useQuery(skip, { refetchInterval: 1000 })
  const { mutate: ready } = trpc.lobby.ready.useMutation()
  const { mutate: start } = trpc.game.start.useMutation()

  useEffect(() => {
    if (error) {
      navigate('/lobby')
    }
    else if (data?.started) {
      navigate('/game')
    }
  }, [data?.started, error, navigate])

  return (
    <>
      <h1>방</h1>
      {data ? (
        <div>
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
                  onChange={(e) => ready({ ready: e.target.checked }, { onSuccess: refetch })}
                />
              }
              label="준비"
            />
          </FormGroup>


          {data.hostReady && data.guestReady && (
            <Button
              variant="contained"
              disabled={data.host !== username}
              onClick={() => start(undefined, { onSuccess: () => navigate('/game') })}
            >
              게임 시작
            </Button> 
          )}
        </div>
      ) : (
        <p>방 정보를 불러오는 중...</p>
      )}
    </>
  )
}

export default Room
