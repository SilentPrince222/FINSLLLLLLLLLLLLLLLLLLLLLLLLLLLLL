# Neon Futures UI Guide — EduTok Edition

**Версия:** 2026-04 · **Статус:** Практический гайд для проекта  
**Стек:** Next.js 14, Tailwind CSS, Dark Mode (next-themes), Design System Tokens

---

## Что такое Neon Futures в контексте EduTok

Это стилистика, которая берет киберпанк-эстетику (1980-е научная фантастика: *Blade Runner*, *Tron*) и переносит её в современные образовательные дашборды. **Главная идея:** высокотехнологичная среда для обучения — ученики должны чувствовать, что они работают с будущим.

**Ключевые характеристики:**
- **Темный фон** (deep navy + black) как базис
- **Светящиеся неоновые цветовые акценты** (cyan, magenta, neon green)
- **Стекломорфизм** (glassmorphism) — полупрозрачные панели с размытием фона
- **Эффект свечения** (glow) на критических элементах (кнопки, графики, уведомления)
- **3D / Изометрические визуализации** для иконок и диаграмм
- **Минимальная анимация** с микротрансформациями при наведении

**Когда использовать:**
- Главный дашборд студента (hero section)
- Visualization карточек оценок и прогресса
- AI-insights панель (анализ успеваемости)
- Interactive графики (charts/analytics)

---

## 1. Архитектура Цветов

Расширяем стандартный `design-system.ts`:

```typescript
// lib/design-system.ts — добавить в существующие colors

export const neonColors = {
  // Эмиссионные цвета (светящиеся)
  cyan: '#00D9FF',      // Электрический голубой
  magenta: '#FF00FF',   // Неоновый пурпурный
  neonGreen: '#39FF14', // Токсичный зелёный
  neonPink: '#FF10F0',  // Яркий розовый
  
  // Вторичные акценты
  cyan50: 'rgba(0, 217, 255, 0.5)',
  magenta50: 'rgba(255, 0, 255, 0.5)',
  
  // Контрастные тёмные фоны
  darkBg: '#0a0a0a',    // Чёрный (для OLED)
  darkBg2: '#121212',   // Deep grey (комфортнее для глаз)
  darkBg3: '#1a1a2e',   // Navy-чёрный
} as const;

// Для свечения (text-shadow и box-shadow)
export const glows = {
  cyan: '0 0 10px rgba(0, 217, 255, 0.6), 0 0 20px rgba(0, 217, 255, 0.3)',
  magenta: '0 0 10px rgba(255, 0, 255, 0.6), 0 0 20px rgba(255, 0, 255, 0.3)',
  neonGreen: '0 0 10px rgba(57, 255, 20, 0.6), 0 0 20px rgba(57, 255, 20, 0.3)',
} as const;
```

**Принцип:** Используйте `neonColors` для акцентов (max 20% экрана), остальное — `colors.slate` для базовой иерархии.

---

## 2. Glassmorphism Панели

**Что это:** Полупрозрачные карточки с размытием фона, имитирующие матовое стекло.

### CSS в `globals.css` или Tailwind:

```css
/* Базовый glassmorphism эффект */
.glass {
  background: rgba(18, 18, 30, 0.8); /* Полупрозрачный тёмный фон */
  backdrop-filter: blur(16px);       /* Размытие фона */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Тонкая границя */
  border-radius: 12px;
}

/* Вариант с неоновой границей */
.glass-neon-cyan {
  @apply glass;
  border-color: rgba(0, 217, 255, 0.3);
  box-shadow: inset 0 0 20px rgba(0, 217, 255, 0.1);
}

/* Вариант с магентой */
.glass-neon-magenta {
  @apply glass;
  border-color: rgba(255, 0, 255, 0.3);
  box-shadow: inset 0 0 20px rgba(255, 0, 255, 0.1);
}
```

### React компонент:

```tsx
// components/ui/GlassCard.tsx
export function GlassCard({ 
  children, 
  neon = 'cyan',
  className 
}: { 
  children: React.ReactNode
  neon?: 'cyan' | 'magenta' | 'none'
  className?: string
}) {
  const baseClass = 'glass'
  const neonClass = neon === 'cyan' ? 'glass-neon-cyan' : 
                    neon === 'magenta' ? 'glass-neon-magenta' : ''
  
  return (
    <div className={`${baseClass} ${neonClass} ${className}`}>
      {children}
    </div>
  )
}
```

---

## 3. Neon Glow Эффекты

**Правило:** Используйте свечение экономно — только для CTA, статусов, важных метрик.

### Text Glow (для заголовков):

```css
.text-neon-cyan {
  color: #00D9FF;
  text-shadow: 
    0 0 10px rgba(0, 217, 255, 0.8),
    0 0 20px rgba(0, 217, 255, 0.5),
    0 0 40px rgba(0, 217, 255, 0.2);
}

.text-neon-magenta {
  color: #FF00FF;
  text-shadow:
    0 0 10px rgba(255, 0, 255, 0.8),
    0 0 20px rgba(255, 0, 255, 0.5),
    0 0 40px rgba(255, 0, 255, 0.2);
}
```

### Box Glow (для кнопок, карточек):

```css
.glow-cyan {
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.6),
              0 0 30px rgba(0, 217, 255, 0.3);
}

.glow-magenta {
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.6),
              0 0 30px rgba(255, 0, 255, 0.3);
}

/* Анимация мерцания (вибрирующий неон) */
@keyframes neon-flicker {
  0%, 100% { text-shadow: 0 0 10px rgba(0, 217, 255, 0.8); }
  50% { text-shadow: 0 0 10px rgba(0, 217, 255, 0.3); }
}

.flicker {
  animation: neon-flicker 3s infinite;
}
```

---

## 4. Компонент Neon Button

```tsx
// components/ui/NeonButton.tsx
import { neonColors } from '@/lib/design-system'

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  neon?: 'cyan' | 'magenta' | 'green'
  size?: 'sm' | 'md' | 'lg'
}

export function NeonButton({ 
  neon = 'cyan', 
  size = 'md',
  className,
  children,
  ...props 
}: NeonButtonProps) {
  const neonColor = {
    cyan: 'border-cyan-400 hover:glow-cyan text-cyan-400',
    magenta: 'border-pink-500 hover:glow-magenta text-pink-500',
    green: 'border-green-400 hover:glow-green text-green-400',
  }[neon]
  
  const sizeClass = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  }[size]

  return (
    <button
      className={`
        ${sizeClass}
        ${neonColor}
        border border-current
        bg-transparent
        rounded-lg
        font-medium
        transition-all duration-200
        hover:scale-105
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Использование:**
```tsx
<NeonButton neon="cyan" size="lg">Анализ оценок</NeonButton>
<NeonButton neon="magenta">Отправить</NeonButton>
```

---

## 5. Neon Grade Card (Пример компонента для оценок)

```tsx
// components/dashboard/NeonGradeCard.tsx
import { GlassCard } from '@/components/ui/GlassCard'

export function NeonGradeCard({ 
  subject, 
  score, 
  trend 
}: { 
  subject: string
  score: number
  trend: 'up' | 'down' | 'stable'
}) {
  const scoreColor = score >= 90 ? 'text-neon-cyan' : 
                     score >= 80 ? 'text-cyan-300' :
                     score >= 70 ? 'text-yellow-400' : 'text-red-400'
  
  const glowClass = score >= 90 ? 'glow-cyan' : ''
  
  return (
    <GlassCard neon="cyan" className={`p-6 ${glowClass}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">{subject}</h3>
        <span className="text-xs text-slate-400">
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      </div>
      
      {/* Большая оценка с свечением */}
      <div className={`text-5xl font-bold ${scoreColor} mb-2`}>
        {score}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-400 to-magenta-400 h-full"
          style={{ width: `${score}%` }}
        />
      </div>
    </GlassCard>
  )
}
```

---

## 6. Темный режим (Dark Mode с next-themes)

**Setup (уже должен быть в проекте):**

```tsx
// app/[locale]/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children, params }) {
  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Tailwind config для Neon Futures:**

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00D9FF',
        'neon-magenta': '#FF00FF',
        'neon-green': '#39FF14',
        'dark-bg': '#0a0a0a',
        'dark-bg-2': '#121212',
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  darkMode: 'class', // Обязательно для next-themes
}
```

**В Tailwind класс:**
```jsx
<div className="dark:bg-dark-bg-2 dark:text-white">
  Этот элемент будет тёмным в dark mode
</div>
```

---

## 7. Доступность (WCAG Compliance)

**Критические правила для Neon Futures:**

### 1. Контраст текста

❌ **ПЛОХО:** Белый текст (`#FFFFFF`) на чёрном + яркое свечение = астигматизм
✅ **ХОРОШО:** Светло-серый текст (`#E8E8E8`) на тёмном фоне + контролируемое свечение

```css
/* Стандартный текст */
body {
  color: #E8E8E8; /* Не совсем белый — комфортнее */
  background: #0a0a0a;
  /* Контраст: 15.5:1 — соответствует WCAG AAA */
}

/* Заголовки могут быть ярче */
h1, h2, h3 {
  color: #FFFFFF; /* Контраст: 21:1 */
}

/* Но НЕ для body text с сильным свечением */
.glow-text {
  color: #E8E8E8; /* Базовый цвет слегка серый */
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.6); /* Свечение добавляет яркость */
}
```

### 2. Не полагаться на цвет один

❌ **ПЛОХО:** Красный узел = ошибка (для дальтоников выглядит коричневым)
✅ **ХОРОШО:** Красный узел + иконка ошибки (⚠️) + текст "Error"

```tsx
// components/StatusBadge.tsx
export function StatusBadge({ status }: { status: 'success' | 'error' | 'warning' }) {
  const config = {
    success: { color: 'text-green-400', icon: '✓', label: 'Success' },
    error: { color: 'text-red-400', icon: '✕', label: 'Error' },
    warning: { color: 'text-yellow-400', icon: '!', label: 'Warning' },
  }
  
  const { color, icon, label } = config[status]
  
  return (
    <span className={`flex items-center gap-1 ${color}`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </span>
  )
}
```

### 3. Focus states обязательны

```css
button:focus-visible {
  outline: 2px solid rgba(0, 217, 255, 0.8);
  outline-offset: 2px;
}

/* WCAG требует: focus ring 2px, контраст 3:1 */
```

### 4. Избегайте чистого чёрного с ярким свечением

```css
/* ❌ ПЛОХО */
.bad {
  background: #000000;
  color: #00D9FF;
  text-shadow: 0 0 20px rgba(0, 217, 255, 1);
  /* Зрачок расширяется максимально → астигматизм */
}

/* ✅ ХОРОШО */
.good {
  background: #0a0a0a; /* Чуть светлее чёрного */
  color: #00D9FF;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.6); /* Более контролируемое свечение */
}
```

---

## 8. Типографика для Neon UI

**Правило:** Используйте **medium (500)** или **bold (700)**, избегайте light (300).

```tsx
// Обновляем design-system.ts

export const neonTypography = {
  // Для заголовков с свечением
  heroTitle: {
    className: 'text-4xl font-bold tracking-tight',
    color: 'text-cyan-50', // Почти белый
  },
  // Для основного текста
  bodyText: {
    className: 'text-base font-medium',
    color: 'text-slate-300', // Светло-серый, не белый
  },
  // Для акцентных меток (красные, зелёные)
  accentLabel: {
    className: 'text-sm font-semibold',
    color: 'text-neon-cyan',
  },
} as const;
```

**Tailwind:**
```jsx
<h1 className="text-4xl font-bold text-cyan-50">
  Добро пожаловать
</h1>

<p className="text-base font-medium text-slate-300">
  Это описание использует medium (не light!) для читаемости
</p>

<span className="text-sm font-semibold text-neon-cyan">
  Свежие данные
</span>
```

---

## 9. Анимации (Минимальные Трансформации)

```css
/* Micro-interaction при наведении */
@keyframes glow-pulse {
  0%, 100% { 
    box-shadow: 0 0 15px rgba(0, 217, 255, 0.5);
  }
  50% { 
    box-shadow: 0 0 25px rgba(0, 217, 255, 0.8);
  }
}

.interactive-element:hover {
  animation: glow-pulse 2s ease-in-out;
  transform: translateY(-2px);
  transition: all 200ms ease-out;
}

/* Shimmer для loading состояния */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(0, 217, 255, 0.1) 0%,
    rgba(0, 217, 255, 0.3) 50%,
    rgba(0, 217, 255, 0.1) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 10. Практический Пример: Dashboard Hero

```tsx
// components/dashboard/DashboardHero.tsx
'use client'

import { useTranslations } from 'next-intl'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'

export function DashboardHero({ studentName, avgScore }) {
  const t = useTranslations('dashboard')

  return (
    <section className="relative mb-8">
      {/* Фоновые градиенты (отрезаны на большой высоте) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen opacity-10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta-500 rounded-full mix-blend-screen opacity-10 blur-3xl" />
      </div>

      <GlassCard neon="cyan" className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Левая колонка: Приветствие */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('greeting', { name: studentName })}
            </h1>
            <p className="text-slate-300 mb-6">
              {t('subtitle')}
            </p>
            
            <div className="space-x-3">
              <NeonButton neon="cyan" size="lg">
                {t('viewAnalysis')}
              </NeonButton>
              <NeonButton neon="magenta" size="lg">
                {t('homework')}
              </NeonButton>
            </div>
          </div>

          {/* Правая колонка: Средняя оценка */}
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              {/* Круг со свечением */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-magenta-400 blur-xl opacity-30" />
              
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-neon-cyan">
                    {avgScore}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    {t('averageScore')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}
```

---

## 11. Чек-лист для внедрения Neon Futures

### Phase 1: Foundation
- [ ] Добавить `neonColors` и `glows` в `design-system.ts`
- [ ] Создать `GlassCard.tsx` компонент
- [ ] Создать `NeonButton.tsx` компонент
- [ ] Добавить CSS для `.glass`, `.glow-*`, `.text-neon-*` в `globals.css`

### Phase 2: Components
- [ ] Создать `NeonGradeCard.tsx`
- [ ] Создать `StatusBadge.tsx` с иконками
- [ ] Обновить dashboard layout с `DashboardHero`

### Phase 3: Polish
- [ ] Добавить focus-visible стили для доступности
- [ ] Проверить контраст (WCAG AAA)
- [ ] Протестировать в simulator для дальтоников (https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [ ] Добавить micro-animations на hover

### Phase 4: Validation
- [ ] Lighthouse Performance (target: >80)
- [ ] WCAG 2.2 Level AA compliance
- [ ] Test на мобильных устройствах

---

## 12. Примеры Цветовых Комбинаций

| Комбинация | Где использовать | WCAG Контраст |
|-----------|------------------|---------------|
| Cyan (#00D9FF) + Black (#0a0a0a) | Структурные элементы, границы | 15.5:1 ✓ AAA |
| Magenta (#FF00FF) + Black | Акценты, CTA | 13.8:1 ✓ AAA |
| Neon Green (#39FF14) + Black | Success states | 12.1:1 ✓ AAA |
| White (#FFFFFF) + Neon Cyan glow | Заголовки | 21:1 ✓ AAA |
| Slate-300 (#CBD5E1) + Black | Body text | 10.2:1 ✓ AAA |

---

## 13. Производительность

**Оптимизация для Neon Futures:**

```css
/* Избегайте частых изменений filter: blur */
.glass {
  /* Плохо: backdrop-filter создаёт новый layer */
  /* Хорошо: использовать только на статических элементах */
  will-change: auto; /* По умолчанию — не создавайте layer без нужды */
}

/* Для анимаций используйте transform и opacity */
.animated {
  /* Плохо: анимирование box-shadow */
  /* Хорошо: анимирование opacity */
  will-change: opacity, transform;
  animation: glow-pulse 2s;
}
```

**Lighthouse рекомендации:**
- Не использовать более 3-4 элементов с `backdrop-filter` одновременно
- Anимации только на 60fps (избегайте 100+ элементов)
- SVG иконки вместо PNG для crispy свечения

---

## 14. Ресурсы

- **Design System Tokens:** `lib/design-system.ts`
- **Tailwind Config:** `tailwind.config.ts`
- **Next-themes:** документация для toggle тёмного режима
- **WCAG Compliance:** https://www.w3.org/WAI/WCAG21/quickref/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Glassmorphism Generator:** https://ui.glass/

---

**Обновлено:** 2026-04-22  
**Ответственный:** Design System Owner  
**Статус:** Production-ready
