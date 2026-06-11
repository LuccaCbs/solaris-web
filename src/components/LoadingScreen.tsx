import { useTranslation } from 'react-i18next'
import { useTheme } from '../utils/useTheme'

import logoBlack from '../assets/logo/solaris-black-full-logo.png'
import logoSilver from '../assets/logo/solaris-white-full-logo.png'
import logoBlackOnly from '../assets/logo/solaris-black-logo-only.png'
import logoWhiteOnly from '../assets/logo/solaris-white-logo-only.png'

function LoadingScreen() {
    const { theme } = useTheme()
    const { t } = useTranslation()

    const fullLogo = theme === 'dark' ? logoSilver : logoBlack
    const spinnerLogo = theme === 'dark' ? logoWhiteOnly : logoBlackOnly

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
            <div className="flex flex-col items-center">
                <img
                    src={fullLogo}
                    alt="Solaris"
                    className="h-28 w-72 object-contain"
                />

                <div className="mt-8 flex h-16 w-16 items-center justify-center">
                    <img
                        src={spinnerLogo}
                        alt=""
                        aria-hidden="true"
                        className="h-14 w-14 animate-spin object-contain opacity-90"
                    />
                </div>

                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                    {t('common.loadingWorkspace')}
                </p>
            </div>
        </main>
    )
}

export default LoadingScreen