'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card } from '@/app/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const { user, signInWithEmail, signInWithGoogle, loading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDonationBanner, setShowDonationBanner] = useState(false)

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('donation-banner-seen')
    if (!hasSeenBanner) {
      setShowDonationBanner(true)
    }
  }, [])

  const closeDonationBanner = () => {
    localStorage.setItem('donation-banner-seen', 'true')
    setShowDonationBanner(false)
  }

  // Note: Redirect is handled by middleware to avoid loops

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await signInWithEmail(email, password)

      if (signInError) {
        setError(signInError)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      await signInWithGoogle()
      // Redirect is handled by OAuth callback
    } catch (err) {
      setError('Erro ao fazer login com Google. Tente novamente.')
      setLoading(false)
    }
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Banner de Doação */}
        {showDonationBanner && (
          <Card className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 relative">
            <button
              onClick={closeDonationBanner}
              className="absolute top-2 right-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                  Ajude a manter o StayFocus gratuito
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  O StayFocus é 100% gratuito e sem anúncios. Se você gosta do projeto, considere fazer uma contribuição para ajudar no desenvolvimento.
                </p>
                <a
                  href="https://www.vakinha.com.br/vaquinha/stayfocus-gratuidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                  >
                    Contribuir com o projeto
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            StayFocus
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Entre na sua conta para continuar
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />

            <Input
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              minLength={6}
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Ou continue com
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link
                href="/registro"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </Card>

        {/* Novidades - Changelog */}
        <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                Confira as últimas novidades e melhorias do StayFocus
              </p>
              <Link href="/changelog">
                <Button variant="outline" size="sm" className="w-full border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40">
                  Ver Changelog
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Links Legais */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ao fazer login, você concorda com nossos{' '}
            <Link
              href="/termos-de-uso"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Termos de Uso
            </Link>
            {' '}e{' '}
            <Link
              href="/politica-de-privacidade"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
