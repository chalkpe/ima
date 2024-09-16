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
import UserHandle from '@ima/client/components/user/UserHandle'

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
        <Stack direction="column" gap="4vmin">
          <Stack direction="row" alignItems="center" gap="4vmin" justifyContent="space-between">
            <Typography fontSize="7vmin" fontWeight="bold">
              방
            </Typography>

            <Stack direction="row" gap="2vmin">
              <Button
                variant="contained"
                color="warning"
                disabled={isHost ? data.hostReady : data.guestReady}
                sx={{ fontSize: '4vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
                onClick={() => leave()}
              >
                나가기
              </Button>

              {isHost && (
                <Button
                  variant="contained"
                  disabled={!data.hostReady || !data.guestReady}
                  sx={{ fontSize: '4vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
                  onClick={() => start(undefined, { onSuccess: () => navigate('/game') })}
                >
                  게임 시작
                </Button>
              )}
            </Stack>
          </Stack>

          <div>
            <Stack direction="row" sx={{ fontSize: '4vmin' }} alignItems="center" gap="1vmin">
              <span>방장: </span>
              {data.hostUser && <UserHandle {...data.hostUser} fontSize={4} />}
              {data.host !== '' ? (
                data.hostReady ? (
                  <CheckOutlined sx={{ width: '4vmin ' }} />
                ) : (
                  <CircularProgress size="4vmin" />
                )
              ) : (
                ''
              )}
            </Stack>
            <Stack direction="row" sx={{ fontSize: '4vmin' }} alignItems="center" gap="1vmin">
              <span>상대: </span>
              {data.guestUser && <UserHandle {...data.guestUser} fontSize={4} />}
              {data.guest !== '' ? (
                data.guestReady ? (
                  <CheckOutlined sx={{ width: '4vmin ' }} />
                ) : (
                  <CircularProgress size="4vmin" />
                )
              ) : (
                ''
              )}
            </Stack>
          </div>

          <FormGroup>
            <FormControlLabel
              label={<Typography fontSize="4vmin">준비</Typography>}
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
              <FormControlLabel
                label={<Typography fontSize="4vmin">동풍전</Typography>}
                value="east"
                disabled={!isHost}
                control={<Radio />}
              />
              <FormControlLabel
                label={<Typography fontSize="4vmin">반장전</Typography>}
                value="south"
                disabled={!isHost}
                control={<Radio />}
              />
              <FormControlLabel
                label={<Typography fontSize="4vmin">일장전</Typography>}
                value="north"
                disabled={!isHost}
                control={<Radio />}
              />
            </RadioGroup>
            <FormControlLabel
              label={<Typography fontSize="4vmin">로컬 역</Typography>}
              disabled={!isHost}
              control={
                <Checkbox
                  checked={data.state.rule.localYaku}
                  onChange={(e) => setLocalYaku({ value: e.target.checked })}
                />
              }
            />
            <FormControlLabel
              label={<Typography fontSize="4vmin">만관 판수묶음</Typography>}
              disabled={!isHost}
              control={
                <Checkbox
                  checked={data.state.rule.manganShibari}
                  onChange={(e) => setManganShibari({ value: e.target.checked })}
                />
              }
            />
            <FormControlLabel
              label={<Typography fontSize="4vmin">투명패</Typography>}
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
