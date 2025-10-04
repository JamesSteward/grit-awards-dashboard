import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FamilyDashboard from './pages/FamilyDashboard'
import LeaderDashboard from './pages/LeaderDashboard'
import DirectorDashboard from './pages/DirectorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminSeed from './pages/AdminSeed'
import AdminResetDemo from './pages/AdminResetDemo'
import TestDatabase from './pages/TestDatabase'
import DiagnosticDashboard from './pages/DiagnosticDashboard'
import SchemaCheck from './pages/SchemaCheck'
import StudentDetail from './pages/StudentDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/family" element={<FamilyDashboard />} />
          <Route path="/leader" element={<LeaderDashboard />} />
          <Route path="/leader/student/:studentId" element={<StudentDetail />} />
          <Route path="/director" element={<DirectorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/seed" element={<AdminSeed />} />
          <Route path="/admin/reset-demo" element={<AdminResetDemo />} />
          <Route path="/test" element={<TestDatabase />} />
          <Route path="/diagnostic" element={<DiagnosticDashboard />} />
          <Route path="/schema" element={<SchemaCheck />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
