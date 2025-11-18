import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const Home = () => <div>Home Page</div>
const Login = () => <div>Login Page</div>
const Register = () => <div>Register Page</div>
const UserMeet = () => <div>UserMeet Page</div>

const getUserMock = vi.fn()

vi.mock('@frontend/utils/auth', () => ({
  getUser: () => getUserMock(),
}))

import React, { JSX } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const user = getUserMock()
  return user ? children : <Navigate to="/login" replace />
}

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/home" element={<Home />} />
    <Route path="/meet" element={<UserMeet />} />
    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

describe('App with PrivateRoute', () => {
  it('redirects to login if user is not logged in', () => {
    getUserMock.mockReturnValue(null)

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders Home if user is logged in', () => {
    getUserMock.mockReturnValue({ id: 1, username: 'test' })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })
})
