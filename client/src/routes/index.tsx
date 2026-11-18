import { Suspense, lazy, type JSX } from 'react'
import { Route, Routes } from 'react-router-dom';
import { Layout, Loading } from '@/components'
import { Paths } from '@/routes/paths';
import { DashboardPage, NotFoundPage } from '@/page'

const StationDetailPage = lazy(() => import('@/page/StationDetailPage').then((m) => ({ default: m.StationDetailPage })))

export const AppRoutes = (): JSX.Element => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path={Paths.home} element={<DashboardPage />} />
                <Route
                    path={Paths.stationPattern}
                    element={
                        <Suspense fallback={<Loading />}>
                            <StationDetailPage />
                        </Suspense>
                    }
                />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
