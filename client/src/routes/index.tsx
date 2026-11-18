import type { JSX } from 'react'
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components'
import { Paths } from '@/routes/paths';
import { DashboardPage, NotFoundPage } from '@/page'

export const AppRoutes = (): JSX.Element => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path={Paths.home} element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
