import { FC, useMemo } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import router from '@ima/client/router'
import createTheme from '@ima/client/theme'
import { trpc } from '@ima/client/utils/trpc'
import useAuth from '@ima/client/hooks/useAuth'

const App: FC = () => {
  const { skip } = useAuth()
  const { data: preference } = trpc.preference.preference.useQuery(skip)

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(() => {
    switch (preference?.theme) {
      case 'LIGHT':
        return createTheme('light')
      case 'DARK':
        return createTheme('dark')
      case 'AUTO':
      default:
        return createTheme(prefersDarkMode ? 'dark' : 'light')
    }
  }, [preference?.theme, prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          width: '100vmin',
          height: '100vmin',
          display: 'flex',
          flexDirection: 'column',
          padding: '10vmin',
        }}
      >
        <CssBaseline />
        <RouterProvider router={router} />
      </Box>
    </ThemeProvider>
  )
}

export default App
