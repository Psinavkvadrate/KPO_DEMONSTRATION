import { describe, it } from 'vitest'
import { render } from '@testing-library/react'

const Home = () => <div>Home</div>
const Login = () => <div>Login</div>
const Register = () => <div>Register</div>
const UserMeet = () => <div>UserMeet</div>

describe('Зage render tests', () => {
  it('Home renders without crashing', () => {
    render(<Home />)
  })

  it('Login renders without crashing', () => {
    render(<Login />)
  })

  it('Register renders without crashing', () => {
    render(<Register />)
  })

  it('UserMeet renders without crashing', () => {
    render(<UserMeet />)
  })
})
