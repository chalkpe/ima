import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuth from '@ima/client/hooks/useAuth'
import { trpc } from '@ima/client/utils/trpc'
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
import BackgroundImage from '@ima/client/components/background-image'

const Game = () => {
  const navigate = useNavigate()
  const { payload, skip } = useAuth()
  const [type, setType] = useState<StateChangeType>()

  const { data, isFetching, error } = trpc.game.state.useQuery(skip)
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

  const me = useMemo(() => (data?.host === payload?.id ? 'host' : 'guest'), [data?.host, payload?.id])
  const opponent = useMemo(() => (data?.host === payload?.id ? 'guest' : 'host'), [data?.host, payload?.id])

  useEffect(() => {
    if (payload === null) navigate('/')
    if (skip || isFetching) return
    if (!data || !data.started || error) {
      navigate('/room')
    }
  }, [data, error, isFetching, navigate, payload, skip])

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
    <AnimatePresence>
      <BackgroundImage type="game" />
      <CenterPanel key="center" room={data} me={me} />
      <KingTiles key="king" wall={data.state.wall} />
      <WallTiles key="wall" wall={data.state.wall} />

      <HandTiles key="hand" hand={data.state[opponent].hand} />
      <RiverTiles key="river" river={data.state[opponent].river} />

      <RiverTiles key="river_me" river={data.state[me].river} me />
      <HandTiles key="hand_me" hand={data.state[me].hand} me turn={data.state.turn === me} />

      <DecisionButton key="decision" decisions={data.state[me].decisions} />
      <MenuPopup key="menu" room={data} me={me} />
      <GameResult key="result" room={data} me={me} />
      {type && <StateChange key="change" type={type} />}
    </AnimatePresence>
  )
}

export default Game
