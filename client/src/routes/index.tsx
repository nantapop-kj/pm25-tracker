import type { JSX } from 'react'
import { Route, Routes } from 'react-router-dom';
import { Paths } from '@/routes/paths';
import { NotFoundPage } from '@/page'

export const AppRoutes = (): JSX.Element => {
    return (
        <Routes>
            <Route path={Paths.home} element={<p>Home</p>} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}