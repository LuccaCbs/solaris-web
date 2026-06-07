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

type RegisterResponse = {
    message: string
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/authenticate', data)
    return response.data
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosClient.post<RegisterResponse>('/auth/register', data)
    return response.data
}

export async function verifyEmail(token: string): Promise<string> {
    const response = await axiosClient.get<string>(
        `/auth/verify-email?token=${token}`
    )

    return response.data
}

type MessageResponse = {
    message: string
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/auth/forgot-password', {
        email,
    })

    return response.data
}

export async function resetPassword(
    token: string,
    newPassword: string
): Promise<MessageResponse> {
    const response = await axiosClient.post<MessageResponse>('/auth/reset-password', {
        token,
        newPassword,
    })

    return response.data
}