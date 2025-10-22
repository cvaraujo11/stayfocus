'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
            <p className="italic">
              "Whāia te iti kahurangi, ki te tuohu koe, me he maunga teitei" - 
              <span className="block sm:inline"> Provérbio da língua Māori</span>
            </p>
            <p className="mt-1 text-xs">
              Tradução: "Busque o tesouro que você mais valoriza, se você inclinar a cabeça, que seja para uma montanha elevada."
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/changelog"
              className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              Changelog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
