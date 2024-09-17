import { useEffect, useMemo, useState } from 'react'
import useAuth from '@ima/client/hooks/useAuth'
import { trpc } from '@ima/client/utils/trpc'
import { useNavigate } from 'react-router-dom'
import Hand from '@ima/client/components/game/Hand'
import River from '@ima/client/components/game/River'
import KingTiles from '@ima/client/components/game/KingTiles'
import Center from '@ima/client/components/game/Center'
import Wall from '@ima/client/components/game/Wall'
import Decisions from '@ima/client/components/game/Decisions'
import Scoreboard from '@ima/client/components/game/Scoreboard'
import type { StateChangeType } from '@ima/server/types/game'
import StateChange from '@ima/client/components/game/StateChange'

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
      <Center state={data.state} me={me} />
      <Wall wall={data.state.wall} />
      <KingTiles wall={data.state.wall} />

      <Hand hand={data.state[opponent].hand} />
      <River river={data.state[opponent].river} />

      <River river={data.state[me].river} me />
      <Hand hand={data.state[me].hand} me />

      <Decisions decisions={data.state[me].decisions} />
      <Scoreboard data={data} me={me} />

      {type && <StateChange type={type} />}
    </>
  )
}

export default Game
