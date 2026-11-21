import { Navigate, Route, Routes } from 'react-router-dom'
import { PAGES } from '../auth/roles.js'
import { RequireRole } from '../components/RequireRole.jsx'
import { AppShell } from '../layout/AppShell.jsx'
import { Login } from '../pages/Login.jsx'
import { ComingSoon } from '../pages/ComingSoon.jsx'
import { Queue } from '../pages/Queue.jsx'

// built pages, one line each: key → element; pages not listed show ComingSoon
const PAGE_ELEMENTS = {
  queue: <Queue />,
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        {PAGES.map((p) => (
          <Route key={p.key} path={p.path} element={<RequireRole page={p.key}>{PAGE_ELEMENTS[p.key] ?? <ComingSoon page={p} />}</RequireRole>} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
