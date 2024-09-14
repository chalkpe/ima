import '@ima/client/root.css'

import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { createWSClient, wsLink } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@ima/client/utils/trpc'
import theme from '@ima/client/theme'
import router from '@ima/client/router'

const Root = () => {
  const [queryClient] = useState(new QueryClient())
  const [trpcClient] = useState(trpc.createClient({ links: [wsLink({ client: createWSClient({ url: '/server' }) })] }))

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
