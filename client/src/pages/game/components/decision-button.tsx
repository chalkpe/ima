import { FC, useCallback, useMemo } from 'react'
import styled from '@emotion/styled'
import SketchButton from '@ima/client/components/sketch-button'
import { Stack, Typography } from '@mui/material'
import Hai from '@ima/client/components/hai'
import { trpc } from '@ima/client/utils/trpc'
import { compareDecisions } from '@ima/client/utils/game'
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

const typeColor: Record<Decision['type'], string> = {
  ankan: '#4caf50',
  gakan: '#4caf50',
  daiminkan: '#4caf50',
  pon: '#42a5f5',
  chi: '#03a9f4',
  nuki: '#03a9f4',
  riichi: '#ff9800',
  tsumo: '#ef5350',
  ron: '#ef5350',
  skip_chankan: '#ba68c8',
  skip_and_tsumo: '#ba68c8',
}

interface DecisionButtonProps {
  decisions: Decision[]
}

const DecisionButton: FC<DecisionButtonProps> = ({ decisions }) => {
  const setHovered = useSetAtom(hoveredAtom)

  const { mutate: ankan } = trpc.game.ankan.useMutation()
  const { mutate: gakan } = trpc.game.gakan.useMutation()
  const { mutate: pon } = trpc.game.pon.useMutation()
  const { mutate: chi } = trpc.game.chi.useMutation()
  const { mutate: daiminkan } = trpc.game.daiminkan.useMutation()
  const { mutate: skipAndTsumo } = trpc.game.skipAndTsumo.useMutation()
  const { mutate: skipChankan } = trpc.game.skipChankan.useMutation()
  const { mutate: callTsumo } = trpc.game.callTsumo.useMutation()
  const { mutate: callRon } = trpc.game.callRon.useMutation()
  const { mutate: riichi } = trpc.game.riichi.useMutation()

  const handlers: Record<Decision['type'], (decision: Decision) => unknown> = useMemo(
    () => ({
      ankan: (d) => d.tile && d.tile.type !== 'back' && ankan({ type: d.tile.type, value: d.tile.value }),
      gakan: (d) => d.tile && d.tile.type !== 'back' && gakan({ type: d.tile.type, value: d.tile.value }),
      pon: (d) => d.otherTiles && pon({ tatsu: [d.otherTiles[0].index, d.otherTiles[1].index] }),
      chi: (d) => d.otherTiles && chi({ tatsu: [d.otherTiles[0].index, d.otherTiles[1].index] }),
      daiminkan: () => daiminkan(),
      skip_and_tsumo: () => skipAndTsumo(),
      skip_chankan: () => skipChankan(),
      tsumo: () => callTsumo(),
      ron: () => callRon(),
      riichi: (d) => d.tile && riichi({ index: d.tile.index }),
      nuki: () => {},
    }),
    [ankan, callRon, callTsumo, chi, daiminkan, gakan, pon, riichi, skipAndTsumo, skipChankan]
  )

  const onClick = useCallback((decision: Decision) => handlers[decision.type](decision), [handlers])

  if (!decisions.length) return null

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
        <HoverSketchButton
          key={[decision.type, decision.tile?.index, decision.otherTiles?.map((t) => t.index).join()].join()}
          onClick={() => [onClick(decision), setHovered(undefined)]}
          onMouseEnter={() => decision.type === 'riichi' && decision.tile && setHovered(decision.tile)}
          style={{
            minWidth: '12vmin',
            minHeight: '12vmin',
            height: '100%',
            backgroundColor: typeColor[decision.type],
          }}
        >
          <Stack direction="column" alignItems="center" justifyContent="center">
            <Typography fontSize="3vmin" fontWeight="bold">
              {typeText[decision.type]}
            </Typography>
            <Stack direction="row" justifyContent="center">
              {decision.tile && <Hai size={3} tile={decision.tile} />}
              {decision.otherTiles?.map((tile) => <Hai key={tile.index} size={3} tile={tile} />)}
            </Stack>
          </Stack>
        </HoverSketchButton>
      ))}
    </Stack>
  )
}

export default DecisionButton

const HoverSketchButton = styled(SketchButton)`
  opacity: 0.75;
  :hover {
    opacity: 1;
  }
`
