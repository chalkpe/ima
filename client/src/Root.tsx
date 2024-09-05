import '@ima/client/root.css'

import background from '@ima/client/assets/background.png'

import { useMemo, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { createWSClient, wsLink } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@ima/client/utils/trpc.ts'
import { useAtomValue } from 'jotai'
import { usernameAtom } from '@ima/client/store/username.ts'
import theme from '@ima/client/theme.ts'
import router from '@ima/client/router.tsx'

const Root = () => {
  const username = useAtomValue(usernameAtom)
  const [queryClient] = useState(new QueryClient())
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [wsLink({ client: createWSClient({ url: 'ws://localhost:3000/', connectionParams: { username } }) })],
      }),
    [username]
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Box
            sx={{
              position: 'relative',
              width: '100vmin',
              height: '100vmin',
              display: 'flex',
              flexDirection: 'column',
              padding: '10vmin',
              backgroundSize: 'cover',
              backgroundImage: `url(${background})`,
            }}
          >
            <CssBaseline />
            <RouterProvider router={router} />
          </Box>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default Root
