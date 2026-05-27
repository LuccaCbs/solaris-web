export type SystemSettings = {
    id: number
    globalLowStockThreshold: number
    hasAdminAccessPassword: boolean
    businessTimezone: string
    cashRegisterAutoCloseTime: string
    updatedAt: string
}

export type UpdateSystemSettingsRequest = {
    globalLowStockThreshold: number
    adminAccessPassword?: string
    businessTimezone?: string
    cashRegisterAutoCloseTime?: string
}

export type ValidateAdminPasswordRequest = {
    password: string
}

export type ValidateAdminPasswordResponse = {
    valid: boolean


}

