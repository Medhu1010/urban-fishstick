import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { TrackersPage } from '../features/trackers/TrackersPage'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { GoalsPage } from '../features/goals/GoalsPage'
import { AnalyticsPage } from '../features/analytics/AnalyticsPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { AppShell } from './layout/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="trackers" element={<TrackersPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
