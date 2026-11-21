import { Navigate, Route, Routes } from 'react-router-dom'
import { PAGES } from '../auth/roles.js'
import { RequireRole } from '../components/RequireRole.jsx'
import { AppShell } from '../layout/AppShell.jsx'
import { Login } from '../pages/Login.jsx'
import { ComingSoon } from '../pages/ComingSoon.jsx'
import { Menu } from '../pages/Menu.jsx'
import { Pos } from '../pages/Pos.jsx'
import { Inventory } from '../pages/Inventory.jsx'
import { Queue } from '../pages/Queue.jsx'
import { Staff } from '../pages/Staff.jsx'
import { Dashboard } from '../pages/Dashboard.jsx'
import { SalesReport } from '../pages/SalesReport.jsx'

// built pages, one line each: key → element; pages not listed show ComingSoon
const PAGE_ELEMENTS = {
  dashboard: <Dashboard />,
  'sales-report': <SalesReport />,
  pos: <Pos />,
  queue: <Queue />,
  inventory: <Inventory />,
  menu: <Menu />,
  staff: <Staff />,
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
