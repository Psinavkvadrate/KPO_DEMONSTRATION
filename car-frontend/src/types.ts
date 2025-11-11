export interface Car {
    VIN: string
    mark: string
    model: string
    prodYear: number
    amount: number
    mileage?: number
    status: string
    condition: string
    img?: string | null
    postDate?: string
}
