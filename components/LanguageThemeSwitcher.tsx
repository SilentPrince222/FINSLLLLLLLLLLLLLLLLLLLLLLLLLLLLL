'use client'

import { useState } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import Button from '@/components/Button'
import { useTranslations } from 'next-intl'

export default function LanguageThemeSwitcher() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'ru', name: t('languages.russian') },
    { code: 'kk', name: t('languages.kazakh') }
  ]

  const themes = [
    { key: 'light', name: t('themes.light'), icon: '☀️' },
    { key: 'dark', name: t('themes.dark'), icon: '🌙' },
    { key: 'system', name: t('themes.system'), icon: '💻' }
  ]

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  const switchTheme = (newTheme: string) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="text"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span>🌐</span>
        <span>{locale === 'ru' ? 'RU' : 'KZ'}</span>
        <span>▼</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-foreground mb-2">
                {t('languages.russian')} / {t('languages.kazakh')}
              </h4>
              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      locale === lang.code
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <h4 className="text-sm font-medium text-foreground mb-2">
                {t('themes.light')} / {t('themes.dark')}
              </h4>
              <div className="space-y-1">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.key}
                    onClick={() => switchTheme(themeOption.key)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                      theme === themeOption.key
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <span>{themeOption.icon}</span>
                    <span>{themeOption.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}