import '@ima/client/root.css'

import { useMemo, useState } from 'react'
import { createWSClient, wsLink } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@ima/client/utils/trpc'
import { useAtomValue } from 'jotai'
import { tokenAtom } from '@ima/client/store/token'
import App from '@ima/client/App'

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
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default Root
