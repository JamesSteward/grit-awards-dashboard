import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import FamilyDashboard from './pages/FamilyDashboard'
import LeaderDashboard from './pages/LeaderDashboard'
import AdminSeed from './pages/AdminSeed'
import AdminResetDemo from './pages/AdminResetDemo'
import TestDatabase from './pages/TestDatabase'
import DiagnosticDashboard from './pages/DiagnosticDashboard'
import SchemaCheck from './pages/SchemaCheck'
import StudentDetail from './pages/StudentDetail'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/family" element={
              <ProtectedRoute requiredUserType="family">
                <FamilyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/leader" element={
              <ProtectedRoute requiredUserType="leader">
                <LeaderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/leader/student/:studentId" element={
              <ProtectedRoute requiredUserType="leader">
                <StudentDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin/seed" element={<AdminSeed />} />
            <Route path="/admin/reset-demo" element={<AdminResetDemo />} />
            <Route path="/test" element={<TestDatabase />} />
            <Route path="/diagnostic" element={<DiagnosticDashboard />} />
            <Route path="/schema" element={<SchemaCheck />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
