import { FC } from 'react'
import useAuth from '@ima/client/hooks/useAuth'
import { trpc } from '@ima/client/utils/trpc'
import { CircularProgress, Stack, Typography } from '@mui/material'
import SketchButton from '@ima/client/components/sketch-button'

const MyProfile: FC = () => {
  const { skip } = useAuth()
  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.lobby.names.useQuery(skip)
  const { mutate } = trpc.lobby.nickname.useMutation({ onSuccess: () => utils.lobby.names.reset() })

  if (!data || isLoading) {
    return (
      <p>
        <CircularProgress />
      </p>
    )
  }

  return (
    <div style={{ fontSize: '4vmin' }}>
      <Stack direction="row" gap="1vmin">
        서버: {data.id.split(':')[0]}
      </Stack>
      <Stack direction="row" gap="1vmin">
        핸들: @{data.username}
      </Stack>
      <Stack direction="row" gap="1vmin">
        이름: {data.displayName}
      </Stack>
      <Stack direction="row" gap="1vmin">
        닉네임:{' '}
        {data.nickname || (
          <Typography color="#777" fontSize="inherit">
            (미설정)
          </Typography>
        )}
        <SketchButton onClick={() => mutate({ nickname: prompt('닉네임을 입력하세요') ?? '' })}>수정</SketchButton>
      </Stack>
    </div>
  )
}

export default MyProfile
