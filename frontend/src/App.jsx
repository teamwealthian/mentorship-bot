import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import AdminCreateUserPage from './pages/AdminCreateUserPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/create-admin"
        element={
          <ProtectedAdminRoute>
            <AdminCreateUserPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
