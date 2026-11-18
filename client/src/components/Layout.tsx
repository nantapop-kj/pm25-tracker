import type { JSX } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Paths } from '@/routes/paths'
import { SkyBackground } from './SkyBackground'
import './Layout.css'

export const Layout = (): JSX.Element => {
  return (
    <div className="app">
      <SkyBackground />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="shell">
        <header className="topbar glass">
          <NavLink to={Paths.home} className="brand">
            PM2.5 Tracker
          </NavLink>
          <div className="topbar-right">
            <nav className="nav" aria-label="Main">
              <NavLink to={Paths.home} end>
                Overview
              </NavLink>
            </nav>
          </div>
        </header>
        <main id="main" className="main">
          <Outlet />
        </main>
        <footer className="footer">
          <p className="glass glass--pill">
            Data from <a href="http://air4thai.pcd.go.th">Air4Thai</a>, Pollution Control Department, Thailand.
          </p>
        </footer>
      </div>
    </div>
  )
}
