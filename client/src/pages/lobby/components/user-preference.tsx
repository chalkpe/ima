import { FC } from 'react'
import SketchBox from '@ima/client/components/sketch-box'
import useAuth from '@ima/client/hooks/useAuth'
import { trpc } from '@ima/client/utils/trpc'
import { Typography } from '@mui/material'
import SketchRadioGroup from '@ima/client/components/sketch-radio-group'
import styled from '@emotion/styled'

const UserPreference: FC = () => {
  const { skip } = useAuth()

  const utils = trpc.useUtils()
  const { data } = trpc.preference.preference.useQuery(skip)
  const { mutate: setTheme } = trpc.preference.theme.useMutation({
    onSuccess: () => utils.preference.preference.reset(),
  })
  const { mutate: setRiichiStick } = trpc.preference.riichiStick.useMutation({
    onSuccess: () => utils.preference.preference.reset(),
  })

  if (!data) return null
  return (
    <SketchBox>
      <Typography fontSize="4vmin">테마</Typography>
      <SketchRadioGroup
        size={4}
        selected={data.theme}
        onSelect={(name) => setTheme(name as typeof data.theme)}
        items={[
          { name: 'AUTO', label: '자동' },
          { name: 'LIGHT', label: '라이트' },
          { name: 'DARK', label: '다크' },
        ]}
      />
      <Typography fontSize="4vmin">리치봉</Typography>
      <SketchRadioGroup
        size={4}
        selected={data.riichiStick}
        onSelect={(name) => setRiichiStick(name as typeof data.riichiStick)}
        items={[
          { name: 'RED', label: <RiichiStick alt="빨강" src="/center/riichi_stick_red.png" /> },
          { name: 'BLUE', label: <RiichiStick alt="파랑" src="/center/riichi_stick_blue.png" /> },
        ]}
      />
    </SketchBox>
  )
}

export default UserPreference

const RiichiStick = styled.img`
  width: 10vmin;
  height: 5vmin;
  object-fit: cover;
  vertical-align: middle;
`
