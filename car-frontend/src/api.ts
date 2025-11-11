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

// ==================== APPOINTMENT API ====================

export interface Appointment {
    appointment_id: number
    appointment_date: string
    duration_minutes: number
    purpose: string
    status: string
    notes?: string
    contract_id: number
    car_brand: string
    car_model: string
    car_vin: string
    manager_name?: string
    manager_email?: string
}

export interface ManagerAppointment extends Appointment {
    client_name: string
    client_phone: string
    user_name: string
    user_email: string
    manager_id?: number
}

// Получить встречи пользователя
export async function fetchUserAppointments(userId: number): Promise<Appointment[]> {
    const res = await api.get<BackendResponse<{ appointments: Appointment[] }>>(`/api/appointments/user/${userId}`)
    return res.data.data?.appointments ?? []
}

// Получить все встречи (для менеджера)
export async function fetchManagerAppointments(): Promise<ManagerAppointment[]> {
    const res = await api.get<BackendResponse<{ appointments: ManagerAppointment[] }>>('/api/appointments/manager')
    return res.data.data?.appointments ?? []
}

// Менеджер привязывается к встрече
export async function assignManagerToAppointment(appointmentId: number, managerId: number) {
    const res = await api.post<BackendResponse>(`/api/appointments/${appointmentId}/assign`, { manager_id: managerId })
    return res.data
}

// Менеджер открепляется от встречи
export async function unassignManagerFromAppointment(appointmentId: number, managerId: number) {
    const res = await api.post<BackendResponse>(`/api/appointments/${appointmentId}/unassign`, { manager_id: managerId })
    return res.data
}

// Обновить встречу
export async function updateAppointment(
    appointmentId: number, 
    updates: {
        appointment_date?: string
        duration_minutes?: number
        purpose?: string
        status?: string
        notes?: string
    }
) {
    const res = await api.put<BackendResponse>(`/api/appointments/${appointmentId}`, updates)
    return res.data
}

// ==================== CAR BOOKING API ====================

// Забронировать автомобиль
export async function bookCar(
    vin: string, 
    bookingData: {
        user_id: number
        client_name: string
        client_phone: string
        amount: number
    }
) {
    const res = await api.post<BackendResponse>(`/api/cars/${vin}/book`, bookingData)
    return res.data
}

// ==================== USER MANAGEMENT API ====================

export interface User {
    id: number
    username: string
    email: string
    role: string
    full_name: string
    created_at: string
}

// Получить всех пользователей
export async function fetchUsers(): Promise<User[]> {
    const res = await api.get<BackendResponse<{ users: User[] }>>('/api/users')
    return res.data.data?.users ?? []
}

// Получить всех менеджеров
export async function fetchManagers(): Promise<User[]> {
    const res = await api.get<BackendResponse<{ managers: User[] }>>('/api/users/managers')
    return res.data.data?.managers ?? []
}

// ==================== CONTRACT API ====================

export interface Contract {
    contract_id: number
    date: string
    client_name: string
    client_phone: string
    amount: number
    status: string
    car_brand: string
    car_model: string
    car_vin: string
}

// Получить все договоры
export async function fetchContracts(): Promise<Contract[]> {
    const res = await api.get<BackendResponse<{ contracts: Contract[] }>>('/api/contracts')
    return res.data.data?.contracts ?? []
}

// ==================== HEALTH CHECK ====================

export async function healthCheck() {
    const res = await api.get('/api/health')
    return res.data
}

export default api