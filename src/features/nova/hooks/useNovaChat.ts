import { useState } from 'react';
import { sendNovaMessage } from '../services/novaApi';
import type {
    NovaActionEvent,
    NovaActionEventType,
    NovaMessage,
    NovaUiAction,
} from '../types/nova.types'
import { resetNovaChat } from '../services/novaApi'

const MUTATING_ACTION_INTENTS: NovaActionEventType[] = [
    'create_product',
    'update_product',
    'deactivate_product',
    'activate_product',
    'update_stock',
    'create_category',
    'create_supplier',
    'update_supplier',
    'delete_supplier',
    'create_supplier_order',
    'mark_supplier_order_sent',
    'complete_supplier_order',
    'cancel_supplier_order',
    'delete_supplier_order',
    'update_supplier_order',
    'create_sale',
    'emit_invoice',
    'create_customer',
    'update_customer',
    'deactivate_customer',
]

const READ_ONLY_ACTION_INTENTS: NovaActionEventType[] = ['show_supplier_order']

function isSuccessfulMutatingAction(message: string): boolean {
    const normalized = message.toLowerCase()

    return (
        !normalized.includes('no encontré')
        && !normalized.includes('no encontre')
        && !normalized.includes('no pude')
        && !normalized.includes('error')
    )
}

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
                response.type === 'tool_result'
                && response.intent
                && (
                    MUTATING_ACTION_INTENTS.includes(response.intent as NovaActionEventType)
                    || READ_ONLY_ACTION_INTENTS.includes(response.intent as NovaActionEventType)
                )
                && (
                    READ_ONLY_ACTION_INTENTS.includes(response.intent as NovaActionEventType)
                    || isSuccessfulMutatingAction(response.message)
                )
            ) {
                const eventType = response.intent as NovaActionEventType

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
