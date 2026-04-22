import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'

export default function StudentQuickLinksSection() {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const actions = [
    { label: t('scanQR'), action: 'scan-qr', description: t('scanAttendance') },
    { label: t('consultation'), action: 'consultation', description: t('bookConsultation') },
    { label: t('curator'), action: 'curator', description: t('contactCurator') },
  ]

  const handleAction = (action: string) => {
    switch (action) {
      case 'scan-qr':
        // Navigate to QR scanner page
        router.push('/dashboard/qr')
        break
      case 'consultation':
        // Navigate to consultation booking
        router.push('/dashboard/consultation')
        break
      case 'curator':
        // Open chat or contact form
        router.push('/dashboard/curator')
        break
      default:
        break
    }
  }

  return (
    <div className="col-span-12 md:col-span-2">
      <Card variant="default" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">🔗</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t('quickActions')}</h3>
            <p className="text-sm text-muted-foreground">{t('importantFunctions')}</p>
          </div>
        </div>
        <div className="space-y-3">
          {actions.map((action, i) => (
            <Button
              key={i}
              variant="secondary"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => handleAction(action.action)}
            >
              <div>
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}