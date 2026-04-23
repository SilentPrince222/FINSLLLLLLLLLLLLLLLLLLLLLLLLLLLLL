'use client'

import { ReactNode, useMemo } from 'react'
import { useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { signOut } from '@/lib/auth'
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CalendarCheck,
  Folder,
  BarChart2,
  User,
  Users,
  ClipboardList,
  Bell,
  MessageCircle,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react'

export type PortalRole = 'student' | 'teacher' | 'parent' | 'admin'

type NavItemDef = {
  label: string
  href: string
  Icon: typeof LayoutDashboard
}

const NAV: Record<PortalRole, NavItemDef[]> = {
  student: [
    { label: 'Главная', href: '/dashboard', Icon: LayoutDashboard },
    { label: 'Оценки', href: '/dashboard/grades', Icon: BookOpen },
    { label: 'Расписание', href: '/dashboard/timetable', Icon: Calendar },
    { label: 'События', href: '/dashboard/events', Icon: CalendarCheck },
    { label: 'Материалы', href: '/dashboard/materials', Icon: Folder },
    { label: 'Аналитика', href: '/dashboard/analytics', Icon: BarChart2 },
    { label: 'Профиль', href: '/dashboard/profile', Icon: User },
  ],
  teacher: [
    { label: 'Главная', href: '/teacher', Icon: LayoutDashboard },
    { label: 'Студенты', href: '/teacher', Icon: Users },
    { label: 'Журнал', href: '/teacher', Icon: ClipboardList },
    { label: 'Расписание', href: '/teacher', Icon: Calendar },
    { label: 'Уведомления', href: '/teacher', Icon: Bell },
    { label: 'Профиль', href: '/teacher', Icon: User },
  ],
  parent: [
    { label: 'Главная', href: '/parent', Icon: LayoutDashboard },
    { label: 'Успеваемость', href: '/parent', Icon: BarChart2 },
    { label: 'Расписание', href: '/parent', Icon: Calendar },
    { label: 'Связаться', href: '/parent', Icon: MessageCircle },
    { label: 'Уведомления', href: '/parent', Icon: Bell },
  ],
  admin: [
    { label: 'Главная', href: '/admin', Icon: LayoutDashboard },
    { label: 'Пользователи', href: '/admin', Icon: Users },
    { label: 'Права доступа', href: '/admin', Icon: Shield },
    { label: 'Статистика', href: '/admin', Icon: BarChart2 },
    { label: 'Настройки', href: '/admin', Icon: Settings },
    { label: 'Уведомления', href: '/admin', Icon: Bell },
  ],
}

const ROLE_ACCENT: Record<PortalRole, string> = {
  student: '',
  teacher: 'mg',
  parent: 'gn',
  admin: 'am',
}

const ROLE_AV_STYLE: Record<PortalRole, { bg: string; border: string; color: string }> = {
  student: { bg: 'rgba(110,231,245,0.1)', border: 'rgba(110,231,245,0.3)', color: 'var(--p-accent)' },
  teacher: { bg: 'rgba(199,168,255,0.1)', border: 'rgba(199,168,255,0.3)', color: 'var(--p-role-teacher)' },
  parent: { bg: 'rgba(134,229,182,0.1)', border: 'rgba(134,229,182,0.3)', color: 'var(--p-role-parent)' },
  admin: { bg: 'rgba(233,196,139,0.1)', border: 'rgba(233,196,139,0.3)', color: 'var(--p-role-admin)' },
}

const ROLE_LABEL: Record<PortalRole, string> = {
  student: 'Студент',
  teacher: 'Преподаватель',
  parent: 'Родитель',
  admin: 'Администратор',
}

interface PortalShellProps {
  role: PortalRole
  title: string
  subtitle?: string
  userName?: string
  userSub?: string
  children: ReactNode
}

function initials(name: string | undefined): string {
  if (!name) return '??'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('')
}

export default function PortalShell({
  role,
  title,
  subtitle,
  userName,
  userSub,
  children,
}: PortalShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const navItems = NAV[role]
  const accentCls = ROLE_ACCENT[role]
  const avStyle = ROLE_AV_STYLE[role]

  const displayName = userName ?? ROLE_LABEL[role]
  const displaySub = userSub ?? ROLE_LABEL[role]

  const dateText = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [locale])

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const switchLang = (l: 'kk' | 'ru') => {
    if (l !== locale) router.replace(pathname, { locale: l })
  }

  return (
    <div className="portal-theme">
      <div className="grid-bg" />
      <div className="aurora" />

      <div className="shell">
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-mark">K</div>
            <div>
              <div className="sb-name">KTI Academy</div>
              <div className="sb-sub">College Portal</div>
            </div>
          </div>

          <nav className="sb-nav">
            <div className="sb-section">Навигация</div>
            {navItems.map((item, i) => {
              const isActive = i === 0
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== navItems[0].href
              const activeCls = isActive ? `active${accentCls ? ' ' + accentCls : ''}` : ''
              const Icon = item.Icon
              return (
                <Link
                  key={item.label + i}
                  href={item.href}
                  className={`nav-item ${activeCls}`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="sb-user">
            <div className="sb-user-card">
              <div
                className="sb-av"
                style={{
                  background: avStyle.bg,
                  borderColor: avStyle.border,
                  color: avStyle.color,
                  border: `1px solid ${avStyle.border}`,
                }}
              >
                {initials(displayName)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="sb-uname" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div className="sb-urole">{displaySub}</div>
              </div>
            </div>
            <button type="button" className="sb-logout" onClick={handleLogout}>
              <LogOut />
              <span>Выйти из системы</span>
            </button>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <h2>{title}</h2>
              <p>{subtitle ?? dateText}</p>
            </div>
            <div className="topbar-right">
              <div className="tb-chip">
                <span className="dot pulse-dot" />
                <span>Онлайн</span>
              </div>
              <div className="lang-switch">
                <button className={locale === 'kk' ? 'on' : ''} onClick={() => switchLang('kk')}>KZ</button>
                <button className={locale === 'ru' ? 'on' : ''} onClick={() => switchLang('ru')}>RU</button>
              </div>
            </div>
          </div>

          <div className="content">{children}</div>
        </div>
      </div>
    </div>
  )
}
