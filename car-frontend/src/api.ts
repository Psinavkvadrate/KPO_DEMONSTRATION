import axios from 'axios'
import type { Car } from './types'


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
})


export type BackendResponse<T = any> = { error: any; data: T }


export async function login(username: string, password: string) {
    const res = await api.post<BackendResponse>('/api/auth/login', { username, password })
    return res.data
}


export async function register(
    username: string,
    password: string,
    email: string,
    full_name: string
) {
    const res = await api.post<BackendResponse>('/api/auth/register', { username, password, email, full_name })
    return res.data
}


export async function fetchCars(): Promise<Car[]> {
    const res = await api.get('/api/cars')
    return res.data?.data?.data ?? []
}


export default api