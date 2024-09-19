import { createBrowserRouter } from 'react-router-dom'
import Entry from '@ima/client/pages/entry/entries'
import Lobby from '@ima/client/pages/lobby/entries'
import Room from '@ima/client/pages/room/entries'
import Game from '@ima/client/pages/game/entries'

const router = createBrowserRouter([
  { path: '/game', element: <Game /> },
  { path: '/room', element: <Room /> },
  { path: '/lobby', element: <Lobby /> },
  { path: '/', element: <Entry /> },
])

export default router
