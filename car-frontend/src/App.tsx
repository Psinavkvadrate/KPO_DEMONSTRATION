import React, { type JSX } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import UserMeet from './pages/UserMeet'
import { getUser } from './utils/auth'
import ManagerMeet from './pages/ManagerMeet'
import ManagerMyMeet from './pages/ManagerMyMeet'
import DKPCreate from './pages/DkpCreate'
import DKPPreview from './pages/DkpPreview'
import UsersManagement from './pages/UsersManagement'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const user = getUser()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/meet" element={<UserMeet />} />
      <Route path="/usermeet" element={<ManagerMeet />} />
      <Route path="/mymeet" element={<ManagerMyMeet />} />
      <Route path="/dkp/create/:appointmentId" element={<DKPCreate />} />
      <Route path="/dkp/preview/:dkpId" element={<DKPPreview />} />
      <Route path="/users" element={<UsersManagement />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}