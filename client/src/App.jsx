import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext';
import Chat from './pages/Chat';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Checking your session...</p>;
  }

  return user
    ? children
    : <Navigate to="/login" replace />;
}

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
