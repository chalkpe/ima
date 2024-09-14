import { useEffect, useMemo } from 'react'
import { trpc } from '@ima/client/utils/trpc'
import { useNavigate } from 'react-router-dom'
import useAuth from '@ima/client/hooks/useAuth'
import { CheckOutlined } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'

const Room = () => {
  const navigate = useNavigate()
  const { payload, skip } = useAuth()
  const { data, error } = trpc.lobby.room.useQuery(skip, { refetchInterval: 1000 })

  const utils = trpc.useUtils()
  const reset = () => utils.lobby.room.reset()
  const invalidate = () => utils.lobby.room.invalidate()

  const { mutate: leave } = trpc.lobby.leave.useMutation({ onSuccess: reset })
  const { mutate: ready } = trpc.lobby.ready.useMutation({ onSuccess: invalidate })
  const { mutate: start } = trpc.game.start.useMutation({ onSuccess: invalidate })
  const { mutate: setLocalYaku } = trpc.lobby.setLocalYaku.useMutation({ onSuccess: invalidate })
  const { mutate: setManganShibari } = trpc.lobby.setManganShibari.useMutation({ onSuccess: invalidate })
  const { mutate: setLength } = trpc.lobby.setLength.useMutation({ onSuccess: invalidate })
  const { mutate: setTransparentMode } = trpc.lobby.setTransparentMode.useMutation({ onSuccess: invalidate })

  useEffect(() => {
    if (skip) return
    if (!data || error) {
      navigate('/lobby')
    } else if (data?.started) {
      navigate('/game')
    }
  }, [data, error, navigate, skip])

  const isHost = useMemo(() => data?.host === payload?.username, [data?.host, payload?.username])

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
              disabled={isHost ? data.hostReady : data.guestReady}
              onClick={() => leave()}
            >
              나가기
            </Button>

            {isHost && (
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
              label="준비"
              control={
                <Checkbox
                  checked={isHost ? data.hostReady : data.guestReady}
                  onChange={(e) => ready({ ready: e.target.checked })}
                />
              }
            />
            <RadioGroup
              row
              value={data.state.rule.length}
              onChange={(e) => setLength({ value: e.target.value as 'east' | 'south' | 'north' })}
            >
              <FormControlLabel label="동풍전" value="east" disabled={!isHost} control={<Radio />} />
              <FormControlLabel label="반장전" value="south" disabled={!isHost} control={<Radio />} />
              <FormControlLabel label="일장전" value="north" disabled={!isHost} control={<Radio />} />
            </RadioGroup>
            <FormControlLabel
              label="로컬 역"
              disabled={!isHost}
              control={
                <Checkbox
                  checked={data.state.rule.localYaku}
                  onChange={(e) => setLocalYaku({ value: e.target.checked })}
                />
              }
            />
            <FormControlLabel
              label="만관 판수묶음"
              disabled={!isHost}
              control={
                <Checkbox
                  checked={data.state.rule.manganShibari}
                  onChange={(e) => setManganShibari({ value: e.target.checked })}
                />
              }
            />
            <FormControlLabel
              label="투명패"
              disabled={!isHost}
              control={
                <Checkbox
                  checked={data.state.rule.transparentMode}
                  onChange={(e) => setTransparentMode({ value: e.target.checked })}
                />
              }
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
