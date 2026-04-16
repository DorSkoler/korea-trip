import { useEffect, useMemo } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppHeader } from './components/AppHeader'
import { loadSeedTrip } from './data/loadTrip'
import i18n, { applyHtmlDir } from './i18n'
import { computeTripConflicts } from './lib/conflicts'
import { currentDayNumber } from './lib/dates'
import DayPage from './routes/DayPage'
import TripOverview from './routes/TripOverview'
import { useUIStore } from './store/useUIStore'

function AnimatedRoutes() {
  const location = useLocation()
  const startDay = currentDayNumber()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TripOverview />} />
        <Route
          path="/day"
          element={<Navigate to={`/day/${startDay}`} replace />}
        />
        <Route path="/day/:dayNumber" element={<DayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const lang = useUIStore((s) => s.lang)
  const trip = useMemo(() => loadSeedTrip(), [])

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
    applyHtmlDir(lang)
  }, [lang])

  if (import.meta.env.DEV) {
    const conflicts = computeTripConflicts(trip.days)
    const totalPlaces = trip.days.reduce(
      (n, d) => n + d.items.filter((i) => i.kind === 'place').length,
      0,
    )
    console.log(`[trip] ${trip.days.length} days · ${totalPlaces} places`)
    if (conflicts.length) console.warn('[trip] conflicts:', conflicts)
    else console.log('[trip] no hard opening-hours conflicts 🎉')
  }

  return (
    <BrowserRouter>
      <AppHeader />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
