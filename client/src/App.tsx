import type { JSX } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SkyProvider } from '@/contexts/SkyContext'
import { AppRoutes } from '@/routes'

export const App = (): JSX.Element => {
  return (
    <SkyProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SkyProvider>
  )
}
