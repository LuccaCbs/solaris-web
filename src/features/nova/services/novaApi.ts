import axios from 'axios';
import type { NovaChatRequest, NovaChatResponse } from '../types/nova.types';

const NOVA_API_URL = import.meta.env.VITE_NOVA_API_URL;

export async function sendNovaMessage(
    payload: NovaChatRequest,
): Promise<NovaChatResponse> {
    const token = localStorage.getItem('solaris_token');
    const language = localStorage.getItem('i18nextLng') ?? 'es';

    const response = await axios.post<NovaChatResponse>(
        `${NOVA_API_URL}/chat`,
        payload,
        {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Accept-Language': language,
            },
        },
    );

    return response.data;
}

export async function resetNovaChat(): Promise<void> {
    const token = localStorage.getItem('solaris_token');
    const language = localStorage.getItem('i18nextLng') ?? 'es';

    await axios.post(
        `${NOVA_API_URL}/chat/reset`,
        {},
        {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Accept-Language': language,
            },
        },
    );
}