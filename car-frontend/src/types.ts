export interface Car {
    VIN: string
    mark: string
    model: string
    prodYear: number
    amount: number
    mileage: number
    status: string
    condition: string
    img?: string
    postDate: string
}

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

export interface User {
    id: number
    username: string
    email: string
    role: string
    full_name: string
    created_at: string
}

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