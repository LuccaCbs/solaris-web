import { useCallback, useEffect, useRef } from 'react'

type UseBarcodeScannerOptions = {
    enabled?: boolean
    onScan: (barcode: string) => void
    minLength?: number
    ignoreWhenFocused?: boolean
}

export function useBarcodeScanner({
    enabled = true,
    onScan,
    minLength = 3,
    ignoreWhenFocused = true,
}: UseBarcodeScannerOptions) {
    const bufferRef = useRef('')
    const lastKeyTimeRef = useRef(0)

    const handleScan = useCallback(
        (value: string) => {
            const normalized = value.trim()

            if (normalized.length >= minLength) {
                onScan(normalized)
            }
        },
        [minLength, onScan],
    )

    useEffect(() => {
        if (!enabled) {
            return
        }

        function shouldIgnoreTarget(target: EventTarget | null) {
            if (!(target instanceof HTMLElement)) {
                return false
            }

            if (!ignoreWhenFocused) {
                return false
            }

            if (target.dataset.barcodeScanner === 'true') {
                return true
            }

            const tagName = target.tagName

            if (tagName === 'TEXTAREA') {
                return true
            }

            if (tagName === 'INPUT') {
                const input = target as HTMLInputElement
                return input.type !== 'hidden' && input.dataset.barcodeScanner !== 'true'
            }

            if (target.isContentEditable) {
                return true
            }

            return false
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (shouldIgnoreTarget(event.target)) {
                bufferRef.current = ''
                return
            }

            const now = Date.now()

            if (now - lastKeyTimeRef.current > 120) {
                bufferRef.current = ''
            }

            lastKeyTimeRef.current = now

            if (event.key === 'Enter') {
                if (bufferRef.current) {
                    event.preventDefault()
                    handleScan(bufferRef.current)
                    bufferRef.current = ''
                }

                return
            }

            if (event.key.length === 1) {
                bufferRef.current += event.key
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [enabled, handleScan, ignoreWhenFocused])

    const bindScannerInput = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                event.preventDefault()
                handleScan(event.currentTarget.value)
                event.currentTarget.value = ''
            }
        },
        [handleScan],
    )

    return { bindScannerInput }
}
