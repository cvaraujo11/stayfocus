'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { changelogData } from '@/app/changelog/changelog-data'

/**
 * Componente de notificação para avisar sobre novas versões
 * 
 * Como usar:
 * 1. Importe este componente no layout ou página principal
 * 2. Ele verificará automaticamente se há uma nova versão
 * 3. Mostra uma notificação discreta que pode ser fechada
 * 4. Usa localStorage para não mostrar a mesma versão novamente
 */
export function ChangelogNotification() {
    const [showNotification, setShowNotification] = useState(false)
    const [latestVersion, setLatestVersion] = useState<string>('')

    useEffect(() => {
        // Pega a versão mais recente
        const latest = changelogData[0]
        if (!latest) return

        // Verifica se o usuário já viu esta versão
        const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion')

        // Verifica se a versão foi lançada nos últimos 7 dias
        const releaseDate = new Date(latest.date)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const isRecent = releaseDate >= sevenDaysAgo

        // Mostra notificação se for uma nova versão e foi lançada recentemente
        if (latest.version !== lastSeenVersion && isRecent) {
            setLatestVersion(latest.version)
            setShowNotification(true)
        }
    }, [])

    const handleClose = () => {
        // Salva que o usuário viu esta versão
        localStorage.setItem('lastSeenChangelogVersion', latestVersion)
        setShowNotification(false)
    }

    const handleViewChangelog = () => {
        // Salva que o usuário viu esta versão
        localStorage.setItem('lastSeenChangelogVersion', latestVersion)
        setShowNotification(false)
    }

    if (!showNotification) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
            <Card className="p-4 shadow-lg border-2 border-blue-500 dark:border-blue-400">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            Nova versão disponível! 🎉
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Versão {latestVersion} foi lançada com novidades e melhorias.
                        </p>

                        <Link href="/changelog" onClick={handleViewChangelog}>
                            <Button size="sm" className="w-full">
                                Ver novidades
                            </Button>
                        </Link>
                    </div>

                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Fechar notificação"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </Card>
        </div>
    )
}
