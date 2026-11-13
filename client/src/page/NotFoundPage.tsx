import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { SkyBackground } from '@/components'
import { Paths } from '@/routes/paths'
import './NotFoundPage.css'

export const NotFoundPage = (): JSX.Element => {
  return (
    <div className="not-found">
      <SkyBackground />
      <main className="not-found-card glass" aria-labelledby="not-found-title">
        <p className="not-found-code" aria-hidden>
          404
        </p>
        <h1 id="not-found-title" className="not-found-title">
          Page not found
        </h1>
        <p className="not-found-text">This page drifted off with the clouds. Check the address, or head back to the overview.</p>
        <Link to={Paths.home} className="btn btn--primary">
          Go to the overview
        </Link>
      </main>
    </div>
  )
}
