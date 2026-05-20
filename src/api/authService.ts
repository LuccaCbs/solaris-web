import axiosClient from './axiosClient'

type LoginRequest = {
    email: string
    password: string
}

type LoginResponse = {
    token: string
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/auth/authenticate', data)
    return response.data
}