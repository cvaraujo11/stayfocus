'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Sparkles, Wrench, Bug, Info, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { changelogData } from './changelog-data'

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <Sparkles className="w-5 h-5 text-blue-500" />
    case 'improvement':
      return <Wrench className="w-5 h-5 text-purple-500" />
    case 'fix':
      return <Bug className="w-5 h-5 text-red-500" />
    case 'info':
      return <Info className="w-5 h-5 text-green-500" />
    default:
      return null
  }
}

const getChangeBadge = (type: string) => {
  switch (type) {
    case 'feature':
      return <Badge variant="blue">Novidade</Badge>
    case 'improvement':
      return <Badge variant="purple">Melhoria</Badge>
    case 'fix':
      return <Badge variant="red">Correção</Badge>
    case 'info':
      return <Badge variant="green">Info</Badge>
    default:
      return null
  }
}

export default function ChangelogPage() {
  const [filter, setFilter] = useState<string>('all')
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  const filteredChangelog = changelogData.map(entry => ({
    ...entry,
    changes: filter === 'all' 
      ? entry.changes 
      : entry.changes.filter(change => change.type === filter)
  })).filter(entry => entry.changes.length > 0)

  // Verifica se a versão foi lançada nos últimos 30 dias
  const isRecent = (dateString: string) => {
    const releaseDate = new Date(dateString)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return releaseDate >= thirtyDaysAgo
  }

  // Toggle collapse de módulo
  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }))
  }

  // Verifica se módulo está expandido
  const isModuleExpanded = (moduleKey: string) => {
    return expandedModules[moduleKey] ?? false
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Changelog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Acompanhe todas as novidades, melhorias e correções do StayFocus
          </p>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('feature')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'feature'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Novidades
            </button>
            <button
              onClick={() => setFilter('improvement')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'improvement'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Melhorias
            </button>
            <button
              onClick={() => setFilter('fix')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'fix'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Correções
            </button>
          </div>
        </Card>

        {/* Timeline de Versões */}
        <div className="space-y-8">
          {filteredChangelog.map((entry, index) => (
            <div key={entry.version} className="relative">
              {/* Linha vertical da timeline */}
              {index < filteredChangelog.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}

              <Card className="p-6 relative">
                {/* Badge de versão */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 relative z-10">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {entry.version.split('.')[1]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Versão {entry.version}
                      </h2>
                      {isRecent(entry.date) && (
                        <Badge variant="green" className="animate-pulse">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Lista de mudanças */}
                <div className="ml-16 space-y-3">
                  {entry.changes.map((change, changeIndex) => (
                    <div
                      key={changeIndex}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="mt-0.5">
                        {getChangeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getChangeBadge(change.type)}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {change.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Módulos agrupados em cards */}
                {entry.modules && entry.modules.length > 0 && (
                  <div className="ml-16 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Funcionalidades por Módulo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entry.modules.map((module, moduleIndex) => {
                        const moduleKey = `${entry.version}-${module.name}-${moduleIndex}`
                        const isExpanded = isModuleExpanded(moduleKey)
                        return (
                          <div
                            key={moduleKey}
                            className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all overflow-hidden"
                          >
                            {/* Header clicável */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleModule(moduleKey)
                              }}
                              className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{module.icon}</span>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {module.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {module.features.length} {module.features.length === 1 ? 'item' : 'itens'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                )}
                              </div>
                            </button>

                            {/* Conteúdo colapsável */}
                            {isExpanded && (
                              <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                                <ul className="space-y-2">
                                  {module.features.map((feature, featureIndex) => (
                                    <li
                                      key={featureIndex}
                                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                      <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>

        {/* Footer com informações */}
        <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Sugestões e Feedback
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tem alguma sugestão de melhoria ou encontrou um bug? Entre em contato conosco através do{' '}
                <Link href="/perfil" className="underline font-medium hover:text-blue-600 dark:hover:text-blue-200">
                  seu perfil
                </Link>
                {' '}ou envie um email para suporte@stayfocus.app
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
