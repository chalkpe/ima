import { createBrowserRouter } from 'react-router-dom'
import Entry from '@ima/client/routes/entry'
import Lobby from '@ima/client/routes/lobby'
import Room from '@ima/client/routes/room'
import Game from '@ima/client/routes/game'

const router = createBrowserRouter([
  { path: '/game', element: <Game /> },
  { path: '/room', element: <Room /> },
  { path: '/lobby', element: <Lobby /> },
  { path: '/', element: <Entry /> },
])

export default router
