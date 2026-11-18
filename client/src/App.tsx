import type { JSX } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { FilterProvider } from '@/contexts/FilterContext'
import { LocationProvider } from '@/contexts/LocationContext'
import { SkyProvider } from '@/contexts/SkyContext'
import { AppRoutes } from '@/routes'

const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const App = (): JSX.Element => {
  return (
    <SkyProvider>
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <FilterProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </FilterProvider>
        </LocationProvider>
      </QueryClientProvider>
    </SkyProvider>
  )
}
