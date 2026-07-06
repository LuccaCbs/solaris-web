import { useState } from 'react';
import { sendNovaMessage } from '../services/novaApi';
import type {
    NovaActionEvent,
    NovaMessage,
    NovaUiAction,
} from '../types/nova.types'
import { resetNovaChat } from '../services/novaApi'
export function useNovaChat() {
    const [messages, setMessages] = useState<NovaMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionEvents, setActionEvents] = useState<NovaActionEvent[]>([])

    async function sendMessage(content: string, options?: { silent?: boolean }) {
        if (!content.trim()) return;

        const userMessage: NovaMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
        };

        if (!options?.silent) {
            setMessages((current) => [...current, userMessage])
        }
        setIsLoading(true);

        try {
            const response = await sendNovaMessage({ message: content });

            if (
                response.type === 'tool_result' &&
                (
                    response.intent === 'create_product' ||
                    response.intent === 'update_stock' ||
                    response.intent === 'create_category'
                )
            ) {

                const successfulActionIntents = [
                    'create_product',
                    'update_stock',
                    'create_category',
                ]

                const isSuccessfulAction =
                    response.type === 'tool_result' &&
                    response.intent !== undefined &&
                    successfulActionIntents.includes(response.intent) &&
                    !response.message.toLowerCase().includes('no encontré') &&
                    !response.message.toLowerCase().includes('no encontre') &&
                    !response.message.toLowerCase().includes('no pude') &&
                    !response.message.toLowerCase().includes('error')

                if (isSuccessfulAction) {
                    const eventType = response.intent as NovaActionEvent['type']

                    setActionEvents((current) => [
                        {
                            id: crypto.randomUUID(),
                            type: eventType,
                            title: eventType,
                            description: response.message,
                            createdAt: new Date(),
                        },
                        ...current,
                    ])
                }
            }

            const assistantMessage: NovaMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response.message,
                type: response.type,
                intent: response.intent,
                data: response.data,
                actions: response.actions,
            };

            setMessages((current) => [...current, assistantMessage]);
        } catch (error) {
            console.error('Nova chat error:', error)
            const errorMessage: NovaMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'No pude comunicarme con Nova Copilot.',
                type: 'error',
            };

            setMessages((current) => [...current, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    function addAssistantMessage(content: string, actions?: NovaUiAction[]) {
        const assistantMessage: NovaMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content,
            type: 'message',
            actions,
        }

        setMessages((current) => [...current, assistantMessage])
    }

    async function resetChat() {
        setMessages([])
        setActionEvents([])

        try {
            await resetNovaChat()
        } catch (error) {
            console.error('Nova chat error:', error)
            // Si falla el reset remoto, igual limpiamos el chat local.
        }
    }

    return {
        messages,
        actionEvents,
        isLoading,
        sendMessage,
        addAssistantMessage,
        resetChat,
    }
}