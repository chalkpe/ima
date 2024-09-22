import { useEffect, useMemo, useState } from 'react'
import useAuth from '@ima/client/hooks/useAuth'
import { trpc } from '@ima/client/utils/trpc'
import { useNavigate } from 'react-router-dom'
import HandTiles from '@ima/client/pages/game/components/hand-tiles'
import RiverTiles from '@ima/client/pages/game/components/river-tiles'
import KingTiles from '@ima/client/pages/game/components/king-tiles'
import CenterPanel from '@ima/client/pages/game/components/center-panel'
import WallTiles from '@ima/client/pages/game/components/wall-tiles'
import DecisionButton from '@ima/client/pages/game/components/decision-button'
import GameResult from '@ima/client/pages/game/components/game-result'
import MenuPopup from '@ima/client/pages/game/components/menu-popup'
import StateChange from '@ima/client/pages/game/components/state-change'
import type { StateChangeType } from '@ima/server/types/game'

const Game = () => {
  const navigate = useNavigate()
  const { payload, skip } = useAuth()
  const [type, setType] = useState<StateChangeType>()

  const { data, error } = trpc.game.state.useQuery(skip)
  const { mutate: giri } = trpc.game.giri.useMutation()

  const utils = trpc.useUtils()
  trpc.game.onStateChange.useSubscription(skip, {
    onData: (type) => {
      if (type === 'update') {
        utils.game.state.invalidate()
        utils.game.getRemainingTileCount.invalidate()
      } else {
        setType(type)
        setTimeout(() => {
          setType(undefined)
          utils.game.state.invalidate()
          utils.game.getRemainingTileCount.invalidate()
        }, 750)
      }
    },
  })

  const me = useMemo(() => (data?.host === payload?.username ? 'host' : 'guest'), [data?.host, payload?.username])
  const opponent = useMemo(() => (data?.host === payload?.username ? 'guest' : 'host'), [data?.host, payload?.username])

  useEffect(() => {
    if (skip) return
    if (!data || !data.started || error) {
      navigate('/lobby')
    }
  }, [data, error, navigate, skip])

  useEffect(() => {
    if (
      data &&
      data.state.turn === me &&
      data.state[me].hand.tsumo &&
      data.state[me].riichi !== null &&
      data.state[me].decisions.length === 0
    ) {
      const { index } = data.state[me].hand.tsumo
      setTimeout(() => giri({ index }), 250) // auto tsumogiri after riichi
    }
  }, [data, giri, me])

  if (!data) return null

  return (
    <>
      <CenterPanel state={data.state} me={me} />
      <WallTiles wall={data.state.wall} />
      <KingTiles wall={data.state.wall} />

      <HandTiles hand={data.state[opponent].hand} />
      <RiverTiles river={data.state[opponent].river} />

      <RiverTiles river={data.state[me].river} me />
      <HandTiles hand={data.state[me].hand} me turn={data.state.turn === me} />

      <DecisionButton decisions={data.state[me].decisions} />
      <MenuPopup room={data} me={me} />
      <GameResult room={data} me={me} />
      {type && <StateChange type={type} />}
    </>
  )
}

export default Game
