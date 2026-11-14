import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, ProtectedRoute } from './components/Auth/RouteGuards'
import DashboardLayout from './components/Dashboard/DashboardLayout'
import AuthCallback from './pages/AuthCallback'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import ResetPassword from './pages/ResetPassword'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AppointmentsPage from './pages/dashboard/AppointmentsPage'
import HealthRecordsPage from './pages/dashboard/HealthRecordsPage'
import OverviewPage from './pages/dashboard/OverviewPage'
import PetsPage from './pages/dashboard/PetsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import VaccinationsPage from './pages/dashboard/VaccinationsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<GuestRoute />}>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="pets" element={<PetsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="records" element={<HealthRecordsPage />} />
              <Route path="vaccinations" element={<VaccinationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
