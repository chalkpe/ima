import { FC } from 'react'
import SketchBox from '@ima/client/components/sketch-box'
import useAuth from '@ima/client/hooks/useAuth'
import { trpc } from '@ima/client/utils/trpc'
import { Stack, Typography } from '@mui/material'
import SketchRadioGroup from '@ima/client/components/sketch-radio-group'
import styled from '@emotion/styled'
import Hai from '@ima/client/components/hai'
import type { SimpleTile } from '@ima/server/types/tile'

const kokushiTiles: SimpleTile[] = [
  { type: 'man', value: 1 },
  { type: 'man', value: 9 },
  { type: 'pin', value: 1 },
  { type: 'pin', value: 9 },
  { type: 'sou', value: 1 },
  { type: 'sou', value: 9 },
  { type: 'wind', value: 1 },
  { type: 'wind', value: 2 },
  { type: 'wind', value: 3 },
  { type: 'wind', value: 4 },
  { type: 'dragon', value: 1 },
  { type: 'dragon', value: 2 },
  { type: 'dragon', value: 3 },
]

const UserPreference: FC = () => {
  const { skip } = useAuth()

  const utils = trpc.useUtils()
  const { data } = trpc.preference.preference.useQuery(skip)
  const { mutate: setTheme } = trpc.preference.theme.useMutation({
    onSuccess: () => utils.preference.preference.reset(),
  })
  const { mutate: setTileTheme } = trpc.preference.tileTheme.useMutation({
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

      <Typography fontSize="4vmin">마작패 테마</Typography>
      <Stack direction="row">
        {kokushiTiles.map((tile, i) => (
          <Hai size={3} tile={tile} key={i} />
        ))}
      </Stack>
      <SketchRadioGroup
        size={4}
        selected={data.tileTheme}
        onSelect={(name) => setTileTheme(name as typeof data.tileTheme)}
        items={[
          { name: 'SIMPLE', label: '심플' },
          { name: 'CLASSIC', label: '클래식' },
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
