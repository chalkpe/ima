import '@ima/client/root.css'

import { useMemo, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { createWSClient, wsLink } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@ima/client/utils/trpc'
import theme from '@ima/client/theme'
import router from '@ima/client/router'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@ima/client/store/token'

const Root = () => {
  const token = useAtomValue(tokenAtom)
  const [queryClient] = useState(new QueryClient())
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [wsLink({ client: createWSClient({ url: '/server', connectionParams: { token } }) })],
      }),
    [token]
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
              backgroundImage: `url(/background.png)`,
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
