import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { trpc } from './utils/trpc.ts'
import { createWSClient, wsLink } from '@trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'

const queryClient = new QueryClient()
const trpcClient = trpc.createClient({
  links: [wsLink({ client: createWSClient({ url: 'ws://localhost:3000/trpc' }) })],
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>
)
