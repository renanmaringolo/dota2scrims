import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import PublicLayout from '@/app/layouts/PublicLayout'
import AuthLayout from '@/app/layouts/AuthLayout'
import AdminLayout from '@/app/layouts/AdminLayout'
import PrivateRoute from '@/components/auth/PrivateRoute'
import AdminRoute from '@/components/auth/AdminRoute'

const PublicCalendar = lazy(() => import('@/app/pages/public/PublicCalendar'))
const TeamProfile = lazy(() => import('@/app/pages/public/TeamProfile'))

const Login = lazy(() => import('@/app/pages/auth/Login'))
const Register = lazy(() => import('@/app/pages/auth/Register'))

const ManagerDashboard = lazy(() => import('@/app/pages/manager/ManagerDashboard'))
const TeamNew = lazy(() => import('@/app/pages/manager/TeamNew'))
const TeamEdit = lazy(() => import('@/app/pages/manager/TeamEdit'))

const AdminDashboard = lazy(() => import('@/app/pages/admin/AdminDashboard'))
const AdminSlots = lazy(() => import('@/app/pages/admin/AdminSlots'))
const AdminScrims = lazy(() => import('@/app/pages/admin/AdminScrims'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: (
          <SuspenseWrapper>
            <PublicCalendar />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/teams/:id',
        element: (
          <SuspenseWrapper>
            <TeamProfile />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <SuspenseWrapper>
            <Login />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/register',
        element: (
          <SuspenseWrapper>
            <Register />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: '/dashboard',
            element: (
              <SuspenseWrapper>
                <ManagerDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/teams/new',
            element: (
              <SuspenseWrapper>
                <TeamNew />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/teams/:id/edit',
            element: (
              <SuspenseWrapper>
                <TeamEdit />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/admin',
            element: (
              <SuspenseWrapper>
                <AdminDashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/admin/slots',
            element: (
              <SuspenseWrapper>
                <AdminSlots />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/admin/scrims',
            element: (
              <SuspenseWrapper>
                <AdminScrims />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
