import axiosClient from './axiosClient'
import type {
    CashRegisterAuthorizationRequest,
    CashRegisterSession,
} from '../types/cashRegister'

function getAuthHeaders() {
    const token = localStorage.getItem('solaris_token')

    return {
        Authorization: `Bearer ${token}`,
    }
}

export async function getCurrentCashRegister(): Promise<CashRegisterSession> {
    const response = await axiosClient.get<CashRegisterSession>(
        '/cash-register/current',
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function getTodayCashRegister(): Promise<CashRegisterSession> {
    const response = await axiosClient.get<CashRegisterSession>(
        '/cash-register/today',
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function openCashRegister(
    data: CashRegisterAuthorizationRequest
): Promise<CashRegisterSession> {
    const response = await axiosClient.post<CashRegisterSession>(
        '/cash-register/open',
        data,
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function closeCashRegister(
    data: CashRegisterAuthorizationRequest
): Promise<CashRegisterSession> {
    const response = await axiosClient.post<CashRegisterSession>(
        '/cash-register/close',
        data,
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}

export async function reopenCashRegister(
    id: number,
    data: CashRegisterAuthorizationRequest
): Promise<CashRegisterSession> {
    const response = await axiosClient.post<CashRegisterSession>(
        `/cash-register/reopen/${id}`,
        data,
        {
            headers: getAuthHeaders(),
        }
    )

    return response.data
}