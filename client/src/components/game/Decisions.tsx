import { FC, useCallback } from "react"
import { Button, Stack } from "@mui/material"
import Mahgen from "./Mahgen"
import { convertTileToCode } from "../../utils/tile"
import type { Decision } from "../../../../server/src/db"
import { trpc } from "../../utils/trpc"

interface DecisionsProps {
  decisions: Decision[]
}

const Decisions: FC<DecisionsProps> = ({ decisions }) => {
  const utils = trpc.useUtils()
  const { mutate: ankan } = trpc.game.ankan.useMutation()

  const onClick = useCallback((decision: Decision) => {
    if (decision.type === 'kan') {
      const type = decision.tile.type
      const value = decision.tile.value
      if (type !== 'back') ankan({ type, value }, { onSuccess: () => utils.game.state.invalidate() })
    }
  }, [ankan, utils.game.state])

  return (
    <Stack direction="row" gap="2vmin" justifyContent="center" position="absolute" bottom="12vmin" right="7vmin">
      {decisions.map((decision) => (
        <Button
          key={decision.type + decision.tile.type + decision.tile.value}
          variant="contained"
          size="large"
          onClick={() => onClick(decision)}>
          {decision.type}
          <Mahgen
            size={2}
            sequence={convertTileToCode(decision.tile)} />
        </Button>
      ))}
    </Stack>
  )
}

export default Decisions
