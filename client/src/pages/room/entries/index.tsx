import { useEffect, useMemo } from 'react'
import { trpc } from '@ima/client/utils/trpc'
import { useNavigate } from 'react-router-dom'
import useAuth from '@ima/client/hooks/useAuth'
import { Stack, Typography } from '@mui/material'
import SketchBox from '@ima/client/components/sketch-box'
import UserHandle from '@ima/client/components/user-handle'
import SketchButton from '@ima/client/components/sketch-button'
import SketchCheckbox from '@ima/client/components/sketch-checkbox'
import SketchRadioGroup from '@ima/client/components/sketch-radio-group'
import SketchDivider from '@ima/client/components/sketch-divider'

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

  const isHost = useMemo(() => data?.host === payload?.id, [data?.host, payload?.id])

  return (
    <>
      {data ? (
        <Stack direction="column" gap="1vmin">
          <Stack direction="row" alignItems="center" gap="4vmin" justifyContent="space-between">
            <Typography fontSize="7vmin" fontWeight="bold">
              방
            </Typography>

            <Stack direction="row" gap="2vmin">
              <SketchButton
                disabled={isHost ? data.hostReady : data.guestReady}
                style={{ fontSize: '4vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
                onClick={() => leave()}
              >
                나가기
              </SketchButton>

              {isHost && (
                <SketchButton
                  disabled={!data.hostReady || !data.guestReady}
                  style={{ fontSize: '4vmin', padding: '1vmin 2vmin', borderRadius: '1vmin' }}
                  onClick={() => start(undefined, { onSuccess: () => navigate('/game') })}
                >
                  게임 시작
                </SketchButton>
              )}
            </Stack>
          </Stack>

          <SketchBox style={{ padding: '3vmin' }}>
            <Stack direction="row" sx={{ fontSize: '4vmin' }} alignItems="center" gap="1vmin">
              {data.host !== '' ? <SketchCheckbox disabled checked={data.hostReady} size={4} /> : ''}
              <span>방장: </span>
              {data.hostUser && <UserHandle {...data.hostUser} fontSize={4} />}
            </Stack>
            <Stack direction="row" sx={{ fontSize: '4vmin' }} alignItems="center" gap="1vmin">
              {data.guest !== '' ? <SketchCheckbox disabled checked={data.guestReady} size={4} /> : ''}
              <span>상대: </span>
              {data.guestUser && <UserHandle {...data.guestUser} fontSize={4} />}
            </Stack>
          </SketchBox>

          <SketchBox>
            <SketchCheckbox
              size={4}
              checked={isHost ? data.hostReady : data.guestReady}
              onChange={(checked) => ready({ ready: checked })}
              style={{ margin: '2vmin' }}
            >
              준비
            </SketchCheckbox>

            <SketchDivider />

            <Stack direction="column" gap="1vmin" style={{ padding: '2vmin' }}>
              <SketchRadioGroup
                size={4}
                selected={data.state.rule.length}
                onSelect={(name) => setLength({ value: name as 'east' | 'south' | 'north' })}
                items={[
                  { name: 'east', label: '동풍전' },
                  { name: 'south', label: '반장전' },
                  { name: 'north', label: '일장전' },
                ]}
                disabled={!isHost}
              />

              <SketchCheckbox
                size={4}
                disabled={!isHost}
                checked={data.state.rule.localYaku}
                onChange={(value) => setLocalYaku({ value })}
              >
                로컬 역
              </SketchCheckbox>

              <SketchCheckbox
                size={4}
                disabled={!isHost}
                checked={data.state.rule.manganShibari}
                onChange={(value) => setManganShibari({ value })}
              >
                만관 판수묶음
              </SketchCheckbox>

              <SketchCheckbox
                size={4}
                disabled={!isHost}
                checked={data.state.rule.transparentMode}
                onChange={(value) => setTransparentMode({ value })}
              >
                투명패
              </SketchCheckbox>
            </Stack>
          </SketchBox>
        </Stack>
      ) : (
        <p>방 정보를 불러오는 중...</p>
      )}
    </>
  )
}

export default Room
