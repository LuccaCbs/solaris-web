import axiosClient from './axiosClient'

export type UserProfile = {
    id: number
    firstname: string
    lastname: string
    email: string
}

export type UpdateUserProfileRequest = {
    firstname: string
    lastname: string
}

export type ChangePasswordRequest = {
    currentPassword: string
    newPassword: string
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
    const response = await axiosClient.get<UserProfile>('/users/me')
    return response.data
}

export async function updateCurrentUserProfile(
    data: UpdateUserProfileRequest
): Promise<UserProfile> {
    const response = await axiosClient.put<UserProfile>('/users/me', data)
    return response.data
}

export async function changeCurrentUserPassword(
    data: ChangePasswordRequest
): Promise<void> {
    await axiosClient.put('/users/me/password', data)
}