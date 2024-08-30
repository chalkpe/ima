import { FC, useCallback } from 'react'
import { Button, Stack } from '@mui/material'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'
import type { Decision } from '../../../../server/src/db'
import { trpc } from '../../utils/trpc'

interface DecisionsProps {
  decisions: Decision[]
}

const Decisions: FC<DecisionsProps> = ({ decisions }) => {
  const utils = trpc.useUtils()
  const { mutate: pon } = trpc.game.pon.useMutation()
  const { mutate: ankan } = trpc.game.ankan.useMutation()
  const { mutate: daiminkan } = trpc.game.daiminkan.useMutation()
  const { mutate: skipAndTsumo } = trpc.game.skipAndTsumo.useMutation()
  const { mutate: skipChankan } = trpc.game.skipChankan.useMutation()

  const onClick = useCallback(
    (decision: Decision) => {
      if (decision.type === 'ankan' && decision.tile) {
        const type = decision.tile.type
        const value = decision.tile.value
        if (type !== 'back') ankan({ type, value }, { onSuccess: () => utils.game.state.invalidate() })
      }

      if (decision.type === 'pon') {
        pon(undefined, { onSuccess: () => utils.game.state.invalidate() })
      }

      if (decision.type === 'daiminkan') {
        daiminkan(undefined, { onSuccess: () => utils.game.state.invalidate() })
      }

      if (decision.type === 'skip_and_tsumo') {
        skipAndTsumo(undefined, { onSuccess: () => utils.game.state.invalidate() })
      }

      if (decision.type === 'skip_chankan') {
        skipChankan(undefined, { onSuccess: () => utils.game.state.invalidate() })
      }
    },
    [ankan, daiminkan, pon, skipAndTsumo, skipChankan, utils.game.state]
  )

  return (
    <Stack direction="row" gap="2vmin" justifyContent="center" position="absolute" bottom="12vmin" right="20vmin">
      {decisions.map((decision) => (
        <Button
          key={decision.type + decision.tile?.type + decision.tile?.value}
          variant="contained"
          color={decision.type === 'tsumo' || decision.type === 'ron' ? 'error' : 'primary'}
          size="large"
          onClick={() => onClick(decision)}
        >
          {decision.type}
          {decision.tile && <Mahgen size={2} sequence={convertTileToCode(decision.tile)} />}
        </Button>
      ))}
    </Stack>
  )
}

export default Decisions
