import { FC, useCallback } from 'react'
import { Button, Stack } from '@mui/material'
import Mahgen from './Mahgen'
import { convertTileToCode } from '../../utils/tile'
import { trpc } from '../../utils/trpc'
import type { Decision } from '../../../../server/src/types/game'

interface DecisionsProps {
  decisions: Decision[]
}

const Decisions: FC<DecisionsProps> = ({ decisions }) => {
  const utils = trpc.useUtils()
  const { mutate: pon } = trpc.game.pon.useMutation()
  const { mutate: chi } = trpc.game.chi.useMutation()
  const { mutate: ankan } = trpc.game.ankan.useMutation()
  const { mutate: gakan } = trpc.game.gakan.useMutation()
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

      if (decision.type === 'gakan' && decision.tile) {
        const type = decision.tile.type
        const value = decision.tile.value
        if (type !== 'back') gakan({ type, value }, { onSuccess: () => utils.game.state.invalidate() })
      }

      if (decision.type === 'pon' && decision.otherTiles) {
        pon(
          { tatsu: [decision.otherTiles[0].index, decision.otherTiles[1].index] },
          { onSuccess: () => utils.game.state.invalidate() }
        )
      }

      if (decision.type === 'chi' && decision.otherTiles) {
        chi(
          { tatsu: [decision.otherTiles[0].index, decision.otherTiles[1].index] },
          { onSuccess: () => utils.game.state.invalidate() }
        )
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
    [ankan, chi, daiminkan, gakan, pon, skipAndTsumo, skipChankan, utils.game.state]
  )

  return (
    <Stack direction="row" gap="2vmin" justifyContent="center" position="absolute" bottom="12vmin" right="20vmin">
      {decisions.map((decision) => (
        <Button
          key={
            decision.type +
            decision.tile?.type +
            decision.tile?.value +
            decision.otherTiles?.map((t) => t.type + t.value + t.attribute + t.background).join('')
          }
          variant="contained"
          color={decision.type === 'tsumo' || decision.type === 'ron' ? 'error' : 'primary'}
          size="large"
          onClick={() => onClick(decision)}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {decision.type.startsWith('skip') ? 'Skip' : decision.type}
          <span>
            {decision.tile && <Mahgen size={2} sequence={convertTileToCode(decision.tile)} />}
            {decision.otherTiles &&
              decision.otherTiles.map((tile) => (
                <Mahgen key={tile.index} size={2} sequence={convertTileToCode(tile)} />
              ))}
          </span>
        </Button>
      ))}
    </Stack>
  )
}

export default Decisions
