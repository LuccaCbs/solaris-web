import axiosClient from './axiosClient'

type LoginRequest = {
    email: string
    password: string
}

type RegisterRequest = {
    firstname: string
    lastname: string
    email: string
    password: string
}

type AuthResponse = {
    token: string
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/authenticate', data)
    return response.data
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data)
    return response.data
}