import { ComponentProps, FC, useCallback } from 'react'
import { Button, Stack } from '@mui/material'
import Mahgen from '@ima/client/components/tile/Mahgen'
import { trpc } from '@ima/client/utils/trpc'
import { compareDecisions } from '@ima/client/utils/tile'
import { useSetAtom } from 'jotai'
import { hoveredAtom } from '@ima/client/store/hovered'
import type { Decision } from '@ima/server/types/game'

const typeText: Record<Decision['type'], string> = {
  ankan: '안깡',
  gakan: '가깡',
  daiminkan: '대명깡',
  pon: '퐁',
  chi: '치',
  nuki: '빼기',
  riichi: '리치',
  tsumo: '쯔모',
  ron: '론',
  skip_chankan: '스킵',
  skip_and_tsumo: '스킵',
}

const typeColor: Record<Decision['type'], ComponentProps<typeof Button>['color']> = {
  ankan: 'success',
  gakan: 'success',
  daiminkan: 'success',
  pon: 'primary',
  chi: 'info',
  nuki: 'info',
  riichi: 'warning',
  tsumo: 'error',
  ron: 'error',
  skip_chankan: 'secondary',
  skip_and_tsumo: 'secondary',
}

interface DecisionsProps {
  decisions: Decision[]
}

const Decisions: FC<DecisionsProps> = ({ decisions }) => {
  const setHovered = useSetAtom(hoveredAtom)

  const { mutate: pon } = trpc.game.pon.useMutation()
  const { mutate: chi } = trpc.game.chi.useMutation()
  const { mutate: ankan } = trpc.game.ankan.useMutation()
  const { mutate: gakan } = trpc.game.gakan.useMutation()
  const { mutate: daiminkan } = trpc.game.daiminkan.useMutation()
  const { mutate: skipAndTsumo } = trpc.game.skipAndTsumo.useMutation()
  const { mutate: skipChankan } = trpc.game.skipChankan.useMutation()
  const { mutate: callTsumo } = trpc.game.callTsumo.useMutation()
  const { mutate: callRon } = trpc.game.callRon.useMutation()
  const { mutate: riichi } = trpc.game.riichi.useMutation()

  const onClick = useCallback(
    (decision: Decision) => {
      if (decision.type === 'ankan' && decision.tile) {
        const type = decision.tile.type
        const value = decision.tile.value
        if (type !== 'back') ankan({ type, value })
      }

      if (decision.type === 'gakan' && decision.tile) {
        const type = decision.tile.type
        const value = decision.tile.value
        if (type !== 'back') gakan({ type, value })
      }

      if (decision.type === 'pon' && decision.otherTiles) {
        pon({ tatsu: [decision.otherTiles[0].index, decision.otherTiles[1].index] })
      }

      if (decision.type === 'chi' && decision.otherTiles) {
        chi({ tatsu: [decision.otherTiles[0].index, decision.otherTiles[1].index] })
      }

      if (decision.type === 'daiminkan') {
        daiminkan()
      }

      if (decision.type === 'skip_and_tsumo') {
        skipAndTsumo()
      }

      if (decision.type === 'skip_chankan') {
        skipChankan()
      }

      if (decision.type === 'tsumo') {
        callTsumo()
      }

      if (decision.type === 'ron') {
        callRon()
      }

      if (decision.type === 'riichi' && decision.tile) {
        riichi({ index: decision.tile.index })
      }
    },
    [ankan, callRon, callTsumo, chi, daiminkan, gakan, pon, riichi, skipAndTsumo, skipChankan]
  )

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap="1.5vmin"
      position="absolute"
      top="0vmin"
      bottom="12vmin"
      left="8vmin"
      right="20vmin"
      alignContent="flex-end"
      justifyContent="flex-end"
    >
      {[...decisions].sort(compareDecisions).map((decision) => (
        <Button
          key={
            decision.type +
            decision.tile?.type +
            decision.tile?.value +
            decision.otherTiles?.map((t) => t.type + t.value + t.attribute + t.background).join('')
          }
          variant="contained"
          color={typeColor[decision.type]}
          size="large"
          onClick={() => onClick(decision)}
          onMouseEnter={() => decision.type === 'riichi' && decision.tile && setHovered(decision.tile.index)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '3vmin',
            fontWeight: 'bold',
            padding: '1vmin 2vmin',
            minWidth: '12vmin',
            opacity: 0.7,
            ':hover': { opacity: 1 },
          }}
        >
          {typeText[decision.type]}
          <Stack direction="row">
            {decision.tile && <Mahgen size={3} tile={decision.tile} />}
            {decision.otherTiles && decision.otherTiles.map((tile) => <Mahgen key={tile.index} size={3} tile={tile} />)}
          </Stack>
        </Button>
      ))}
    </Stack>
  )
}

export default Decisions
