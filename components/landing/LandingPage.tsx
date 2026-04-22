'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import {
    ArrowRight,
    MapPin,
    Calculator,
    Briefcase,
    Palette,
    Plane,
    Building2,
    Users,
    Languages,
    GraduationCap,
    Globe,
    Accessibility,
    Phone,
    Printer,
    Smartphone,
    Mail,
    Train,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Lang = 'ru' | 'kk'

type Spec = {
    code: string
    title: Record<Lang, string>
    qual: Record<Lang, string>
    desc: Record<Lang, string>
    Icon: LucideIcon
    pills: Record<Lang, string[]>
}

const SPECS: Spec[] = [
    {
        code: '0518000',
        title: { ru: 'Учёт и аудит', kk: 'Есеп және аудит' },
        qual: { ru: '0518023 · Бухгалтер-ревизор (аудитор)', kk: '0518023 · Бухгалтер-ревизор (аудитор)' },
        desc: {
            ru: 'Финансовый контроль, налоговый консалтинг, подготовка отчётности по МСФО. Базовый уровень финансовой безопасности для МСБ Алматы.',
            kk: 'Қаржылық бақылау, салық консалтингі, ХҚЕС бойынша есептілік. Алматының ШОБ үшін қаржылық қауіпсіздіктің базалық деңгейі.',
        },
        Icon: Calculator,
        pills: {
            ru: ['Бухгалтер-ревизор', 'МСФО', '4 года'],
            kk: ['Бухгалтер-ревизор', 'ХҚЕС', '4 жыл'],
        },
    },
    {
        code: '0515000',
        title: { ru: 'Менеджмент', kk: 'Менеджмент' },
        qual: { ru: '0515013 · Менеджер', kk: '0515013 · Менеджер' },
        desc: {
            ru: 'Логистика, ритейл, операционное управление. Практико-ориентированная программа под нужды Алматы как торгового хаба Центральной Азии.',
            kk: 'Логистика, ритейл, операциялық басқару. Алматыны Орталық Азияның сауда хабы ретінде қолдауға бағытталған тәжірибелік бағдарлама.',
        },
        Icon: Briefcase,
        pills: {
            ru: ['Операционный менеджмент', 'Логистика', '4 года'],
            kk: ['Операциялық басқару', 'Логистика', '4 жыл'],
        },
    },
    {
        code: '0402000',
        title: { ru: 'Дизайн', kk: 'Дизайн' },
        qual: { ru: '0402013 · Дизайнер', kk: '0402013 · Дизайнер' },
        desc: {
            ru: 'Графический, цифровой, UI/UX. Институциональный ответ на рост креативной экономики и цифровизацию бизнеса.',
            kk: 'Графикалық, цифрлық, UI/UX дизайн. Креативті экономика мен бизнесті цифрландыруға институционалдық жауап.',
        },
        Icon: Palette,
        pills: { ru: ['UI/UX', 'Графика', '4 года'], kk: ['UI/UX', 'Графика', '4 жыл'] },
    },
    {
        code: '0511000',
        title: { ru: 'Туризм', kk: 'Туризм' },
        qual: { ru: '0511043 · Менеджер', kk: '0511043 · Менеджер' },
        desc: {
            ru: 'Въездной и внутренний туризм, гостеприимство, кросс-культурная коммуникация. Алматы — ворота к горному кластеру Тянь-Шаня.',
            kk: 'Ішкі және кіру туризмі, қонақжайлылық, мәдениетаралық коммуникация. Алматы — Тянь-Шань тауларының қақпасы.',
        },
        Icon: Plane,
        pills: { ru: ['Гостеприимство', 'Ивенты', '4 года'], kk: ['Қонақжайлылық', 'Ивенттер', '4 жыл'] },
    },
]

type LangItem = {
    code: string
    name: Record<Lang, string>
    native: string
    flag: string
    symbol: string
    level: string
}

const LANGS: LangItem[] = [
    { code: 'KZ', name: { ru: 'Казахский язык', kk: 'Қазақ тілі' }, native: 'Қазақ тілі', flag: '#00AFCA', symbol: 'Қ', level: 'A1 → C1' },
    { code: 'RU', name: { ru: 'Русский язык', kk: 'Орыс тілі' }, native: 'Русский язык', flag: '#D52B1E', symbol: 'Р', level: 'A1 → C1' },
    { code: 'EN', name: { ru: 'Английский язык', kk: 'Ағылшын тілі' }, native: 'English', flag: '#012169', symbol: 'E', level: 'A1 → C1' },
    { code: 'TR', name: { ru: 'Турецкий язык', kk: 'Түрік тілі' }, native: 'Türkçe', flag: '#E30A17', symbol: 'T', level: 'A1 → C1' },
    { code: 'ZH', name: { ru: 'Китайский язык', kk: 'Қытай тілі' }, native: '中文', flag: '#DE2910', symbol: '中', level: 'HSK 1–4' },
    { code: 'AR', name: { ru: 'Арабский язык', kk: 'Араб тілі' }, native: 'العربية', flag: '#006233', symbol: 'ع', level: 'A1 → C1' },
    { code: 'FR', name: { ru: 'Французский язык', kk: 'Француз тілі' }, native: 'Français', flag: '#002654', symbol: 'F', level: 'A1 → C1' },
    { code: 'DE', name: { ru: 'Немецкий язык', kk: 'Неміс тілі' }, native: 'Deutsch', flag: '#1A1A2E', symbol: 'D', level: 'A1 → C1' },
    { code: 'KR', name: { ru: 'Корейский язык', kk: 'Корей тілі' }, native: '한국어', flag: '#003478', symbol: '한', level: 'TOPIK 1–2' },
]

const BUSES: { n: string; t: 'bus' | 'trolley' }[] = [
    { n: '5', t: 'bus' }, { n: '5А', t: 'bus' }, { n: '5Б', t: 'bus' },
    { n: '29', t: 'bus' }, { n: '29Р', t: 'bus' },
    { n: '32', t: 'bus' }, { n: '119', t: 'bus' },
    { n: '65', t: 'bus' }, { n: '66', t: 'bus' },
    { n: '111', t: 'bus' }, { n: '141', t: 'bus' }, { n: '133', t: 'bus' },
    { n: '4', t: 'bus' }, { n: '7', t: 'bus' }, { n: '10', t: 'bus' },
    { n: '11', t: 'trolley' }, { n: '13', t: 'trolley' },
    { n: '40', t: 'bus' }, { n: '50', t: 'bus' }, { n: '54', t: 'bus' },
    { n: '60', t: 'bus' }, { n: '63', t: 'bus' }, { n: '72', t: 'bus' },
    { n: '75', t: 'bus' }, { n: '100', t: 'bus' }, { n: '121', t: 'bus' },
]

const TICKER: Record<Lang, [LucideIcon, string, string][]> = {
    ru: [
        [MapPin, 'Казыбек би 168', 'Алмалинский район'],
        [Building2, 'Корпуса 168A+168B', '6+5 этажей · ж/б'],
        [Users, '1 240 студентов', '4 специальности'],
        [Languages, '9 языков', '27 500 ₸ / мес'],
        [GraduationCap, 'Прикладной бакалавриат', 'высший колледж'],
        [Globe, 'Партнёр Ун-та им. Ясави', 'QS 761–770'],
        [Plane, 'Стажировка в Стамбуле', '1 месяц · каждый год'],
        [Accessibility, 'Доступная среда', 'лифт · пандус · звонки'],
    ],
    kk: [
        [MapPin, 'Қазыбек би 168', 'Алмалы ауданы'],
        [Building2, '168A+168B корпустары', '6+5 қабат · т/б'],
        [Users, '1 240 студент', '4 мамандық'],
        [Languages, '9 тіл', 'айына 27 500 ₸'],
        [GraduationCap, 'Қолданбалы бакалавриат', 'жоғары колледж'],
        [Globe, 'Ясауи Ун-ті серіктесі', 'QS 761–770'],
        [Plane, 'Стамбулда тәжірибеден өту', '1 ай · жыл сайын'],
        [Accessibility, 'Инклюзивті орта', 'лифт · пандус · шақыру'],
    ],
}

export default function LandingPage() {
    const t = useTranslations('landing')
    const locale = useLocale() as Lang
    const router = useRouter()

    const [onlineCount, setOnlineCount] = useState(87)

    useEffect(() => {
        const id = setInterval(() => {
            setOnlineCount(80 + Math.floor(Math.random() * 14))
        }, 3000)
        return () => clearInterval(id)
    }, [])

    const changeLocale = (next: Lang) => {
        if (next === locale) return
        router.replace('/', { locale: next })
    }

    const pillColor = (i: number) => ['cyan', 'magenta', 'green', 'amber'][i % 4]

    const tickerItems = TICKER[locale] ?? TICKER.ru
    const tickerRow = useMemo(
        () => [...tickerItems, ...tickerItems], // double for seamless loop
        [tickerItems],
    )

    const monthLabel = locale === 'kk' ? 'ай' : 'мес'
    const hoursLabel = locale === 'kk' ? 'сағ/апта' : 'ч/нед'
    const groupLabel = locale === 'kk' ? 'Топ' : 'Группа'
    const busLabel = locale === 'kk' ? 'авт.' : 'авт.'
    const trLabel = locale === 'kk' ? 'трол.' : 'трол.'

    return (
        <div className="kti-landing">
            <style precedence="default">{LANDING_CSS}</style>

            <div className="grid-bg" aria-hidden="true" />
            <div className="aurora" aria-hidden="true" />

            <header>
                <div className="logo">
                    <div className="logo-mark">K</div>
                    <div className="logo-text-wrap">
                        <div className="logo-name">
                            KTI Academy <span className="logo-dot">·</span> CMS
                        </div>
                        <div className="logo-sub">{t('brandSub')}</div>
                    </div>
                </div>
                <nav aria-label={t('a11y.nav')}>
                    <ul>
                        <li><a href="#specs">{t('nav.specs')}</a></li>
                        <li><a href="#languages">{t('nav.languages')}</a></li>
                        <li><a href="#admission">{t('nav.admission')}</a></li>
                        <li><a href="#campus">{t('nav.campus')}</a></li>
                        <li><a href="#contact">{t('nav.contact')}</a></li>
                    </ul>
                </nav>
                <div className="header-right">
                    <div className="lang-switch" role="group" aria-label={t('a11y.langSwitch')}>
                        <button
                            type="button"
                            className={locale === 'kk' ? 'active' : ''}
                            onClick={() => changeLocale('kk')}
                        >
                            KZ
                        </button>
                        <button
                            type="button"
                            className={locale === 'ru' ? 'active' : ''}
                            onClick={() => changeLocale('ru')}
                        >
                            RU
                        </button>
                    </div>
                    <Link className="btn-login" href="/auth/login">
                        <span>{t('cta.login')}</span>
                        <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                </div>
            </header>

            <div className="ticker" aria-hidden="true">
                <div className="ticker-track">
                    {tickerRow.map(([Icon, title, sub], i) => (
                        <span key={i}>
                            <Icon size={14} strokeWidth={1.8} />
                            {title} <b>{sub}</b>
                            <span className="ticker-sep">◆</span>
                        </span>
                    ))}
                </div>
            </div>

            <main>
                <section className="hero">
                    <div className="container hero-grid">
                        <div className="hero-left">
                            <div>
                                <div className="hero-kicker">
                                    <span className="pulse" />
                                    <span>{t('hero.kicker')}</span>
                                </div>
                                <h1 className="hero-title">
                                    {t('hero.titleLead')}
                                    <br />
                                    <span className="gradient">{t('hero.titleBrand')}</span>
                                </h1>
                                <p className="hero-sub">{t('hero.sub')}</p>
                            </div>
                            <div>
                                <div className="hero-cta">
                                    <Link className="btn primary" href="/auth/login">
                                        <span>{t('cta.dashboard')}</span>
                                        <ArrowRight size={16} strokeWidth={2} />
                                    </Link>
                                    <a className="btn ghost" href="#specs">
                                        {t('cta.tour')}
                                    </a>
                                </div>
                                <div className="live-count">
                                    <div className="live-stat">
                                        <div className="n">1240</div>
                                        <div className="l">{t('stats.students')}</div>
                                        <div className="d">{t('stats.studentsSub')}</div>
                                    </div>
                                    <div className="live-stat">
                                        <div className="n mg">168</div>
                                        <div className="l">{t('stats.address')}</div>
                                        <div className="d">{t('stats.addressSub')}</div>
                                    </div>
                                    <div className="live-stat">
                                        <div className="n gn">{onlineCount}</div>
                                        <div className="l">{t('stats.online')}</div>
                                        <div className="d">{t('stats.onlineSub')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="building-panel">
                            <div className="building-head">
                                <div className="addr">
                                    <MapPin size={14} strokeWidth={2} />
                                    <span>Қазыбек би 168, Almalı</span>
                                </div>
                                <div className="coord">43.247° N · 76.931° E · 050026</div>
                            </div>
                            <div className="building-svg-wrap">
                                <BuildingSVG />
                                <div className="building-hot" style={{ top: '46%', left: '27%' }}>
                                    <div className="tip">
                                        <b>{t('bld.hot.a')}</b>
                                        {t('bld.hot.aSub')}
                                    </div>
                                </div>
                                <div className="building-hot mg" style={{ top: '56%', left: '62%' }}>
                                    <div className="tip">
                                        <b>{t('bld.hot.b')}</b>
                                        {t('bld.hot.bSub')}
                                    </div>
                                </div>
                                <div className="building-hot" style={{ top: '88%', left: '50%' }}>
                                    <div className="tip">
                                        <b>{t('bld.hot.park')}</b>
                                        {t('bld.hot.parkSub')}
                                    </div>
                                </div>
                            </div>
                            <div className="building-foot">
                                <div>
                                    <div className="l">{t('bld.type')}</div>
                                    <div className="v">
                                        {t('bld.typePre')} <b>6+5</b> {t('bld.typePost')}
                                    </div>
                                </div>
                                <div>
                                    <div className="l">{t('bld.open')}</div>
                                    <div className="v">08:00 — 17:00</div>
                                </div>
                                <div>
                                    <div className="l">{t('bld.access')}</div>
                                    <div className="v">{t('bld.accessValue')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="block" id="specs">
                    <div className="container">
                        <div className="sec-head">
                            <div>
                                <div className="sec-kicker">// 01 · {t('specs.kicker')}</div>
                                <h2>{t('specs.title')}</h2>
                                <div className="sec-sub">{t('specs.sub')}</div>
                            </div>
                        </div>
                        <div className="specs-grid">
                            {SPECS.map((s) => (
                                <article key={s.code} className="spec">
                                    <div className="code">{s.code}</div>
                                    <div className="spec-ico">
                                        <s.Icon size={22} strokeWidth={1.8} />
                                    </div>
                                    <h3>{s.title[locale]}</h3>
                                    <div className="qual">{s.qual[locale]}</div>
                                    <p>{s.desc[locale]}</p>
                                    <div className="meta">
                                        {s.pills[locale].map((p, i) => (
                                            <span key={p} className={`pill ${pillColor(i)}`}>
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="block lang-center-bg" id="languages">
                    <div className="container">
                        <div className="sec-head">
                            <div>
                                <div className="sec-kicker">// 02 · {t('lang.kicker')}</div>
                                <h2>{t('lang.title')}</h2>
                                <div className="sec-sub">{t('lang.sub')}</div>
                            </div>
                        </div>
                        <div className="lang-grid">
                            {LANGS.map((l) => (
                                <article key={l.code} className="lang-card">
                                    <div
                                        className="lang-flag"
                                        style={{
                                            background: `linear-gradient(145deg, ${l.flag}, ${l.flag}AA)`,
                                        }}
                                    >
                                        {l.symbol}
                                    </div>
                                    <div className="lang-body">
                                        <h4>{l.name[locale]}</h4>
                                        <div className="native">
                                            {l.native} · {l.level}
                                        </div>
                                        <div className="lang-meta">
                                            <span>
                                                {groupLabel} <b>8–13</b>
                                            </span>
                                            <span>6 {hoursLabel}</span>
                                            <span>
                                                <b>3</b> {monthLabel}
                                            </span>
                                        </div>
                                        <div className="lang-price">
                                            <div className="pr">
                                                27 500 ₸ <span>/ {monthLabel}</span>
                                            </div>
                                            <div className="lvl">{l.code}</div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="block" id="admission">
                    <div className="container">
                        <div className="sec-head">
                            <div>
                                <div className="sec-kicker">// 03 · {t('adm.kicker')}</div>
                                <h2>{t('adm.title')}</h2>
                            </div>
                        </div>
                        <div className="admission">
                            <div className="tier bachelor">
                                <span className="pill cyan">{t('adm.bach.tag')}</span>
                                <h3>{t('adm.bach.title')}</h3>
                                <div className="t-sub">{t('adm.bach.sub')}</div>
                                <ul>
                                    {(['1', '2', '3', '4', '5'] as const).map((k) => (
                                        <li key={k}>{t(`adm.bach.items.${k}`)}</li>
                                    ))}
                                </ul>
                                <Link className="btn primary" href="/auth/login">
                                    <span>{t('adm.bach.cta')}</span>
                                    <ArrowRight size={16} strokeWidth={2} />
                                </Link>
                            </div>
                            <div className="tier master">
                                <span className="pill magenta">{t('adm.mast.tag')}</span>
                                <h3>{t('adm.mast.title')}</h3>
                                <div className="t-sub">{t('adm.mast.sub')}</div>
                                <ul>
                                    {(['1', '2', '3', '4', '5'] as const).map((k) => (
                                        <li key={k}>{t(`adm.mast.items.${k}`)}</li>
                                    ))}
                                </ul>
                                <a className="btn ghost" href="#contact">
                                    {t('adm.mast.cta')}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="block" id="campus">
                    <div className="container">
                        <div className="sec-head">
                            <div>
                                <div className="sec-kicker">// 04 · {t('campus.kicker')}</div>
                                <h2>{t('campus.title')}</h2>
                                <div className="sec-sub">{t('campus.sub')}</div>
                            </div>
                        </div>
                        <div className="campus-wrap">
                            <CampusSVG />
                            <div className="pin" style={{ top: '62%', left: '52%' }}>
                                <div className="dot" />
                                <div className="tip">
                                    <b>{t('campus.pins.a')}</b>
                                    {t('campus.pins.aSub')}
                                </div>
                            </div>
                            <div className="pin mg" style={{ top: '62%', left: '56%' }}>
                                <div className="dot" />
                                <div className="tip">
                                    <b>{t('campus.pins.b')}</b>
                                    {t('campus.pins.bSub')}
                                </div>
                            </div>
                            <div className="pin gn" style={{ top: '40%', left: '33%' }}>
                                <div className="dot" />
                                <div className="tip">
                                    <b>{t('campus.pins.stop')}</b>
                                    {t('campus.pins.stopSub')}
                                </div>
                            </div>
                            <div className="pin" style={{ top: '40%', left: '80%' }}>
                                <div className="dot" />
                                <div className="tip">
                                    <b>{t('campus.pins.stop2')}</b>
                                    {t('campus.pins.stop2Sub')}
                                </div>
                            </div>
                            <div className="pin mg" style={{ top: '12%', left: '15%' }}>
                                <div className="dot" />
                                <div className="tip">
                                    <b>{t('campus.pins.metro')}</b>
                                    {t('campus.pins.metroSub')}
                                </div>
                            </div>
                        </div>

                        <div className="bus-section">
                            <div className="bus-title">{t('campus.busTitle')}</div>
                            <div className="bus-strip">
                                {BUSES.map((b, i) => (
                                    <div key={`${b.n}-${i}`} className={`bus-chip${b.t === 'trolley' ? ' trolley' : ''}`}>
                                        <span className="bus-t">{b.t === 'trolley' ? trLabel : busLabel}</span>
                                        <span className="num">№{b.n}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer id="contact">
                <div className="container">
                    <div className="foot-grid">
                        <div>
                            <div className="logo foot-logo">
                                <div className="logo-mark">K</div>
                                <div className="logo-text-wrap">
                                    <div className="logo-name">KTI Academy · CMS</div>
                                    <div className="logo-sub">{t('brandSub')}</div>
                                </div>
                            </div>
                            <p className="foot-about">{t('foot.about')}</p>
                            <div className="meta">© 2025 KTI Academy · {t('foot.rights')}</div>
                        </div>
                        <div>
                            <h5>{t('foot.addr.title')}</h5>
                            <div className="contact-row">
                                <MapPin size={14} strokeWidth={1.8} />
                                <span>{t('foot.addr.line1')}</span>
                            </div>
                            <div className="contact-row contact-indent">
                                <span>{t('foot.addr.line2')}</span>
                            </div>
                            <div className="contact-row contact-gap">
                                <Train size={14} strokeWidth={1.8} />
                                <span>{t('foot.addr.line3')}</span>
                            </div>
                        </div>
                        <div>
                            <h5>{t('foot.contact.title')}</h5>
                            <a className="contact-row contact-link" href="tel:+77273797894">
                                <Phone size={14} strokeWidth={1.8} />
                                <span>+7 (727) 379-78-94</span>
                            </a>
                            <div className="contact-row">
                                <Printer size={14} strokeWidth={1.8} />
                                <span>+7 (727) 379-78-93</span>
                            </div>
                            <a className="contact-row contact-link" href="tel:+77784315806">
                                <Smartphone size={14} strokeWidth={1.8} />
                                <span>+7 (778) 431-58-06</span>
                            </a>
                            <a className="contact-row contact-link" href="mailto:info@ktiacademy.kz">
                                <Mail size={14} strokeWidth={1.8} />
                                <span>info@ktiacademy.kz</span>
                            </a>
                        </div>
                        <div>
                            <h5>{t('foot.links.title')}</h5>
                            <ul className="foot-list">
                                {(['1', '2', '3', '4', '5'] as const).map((k) => (
                                    <li key={k}>{t(`foot.links.items.${k}`)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function BuildingSVG() {
    return (
        <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="kti-skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0A0A1E" />
                    <stop offset="1" stopColor="#07070E" />
                </linearGradient>
                <linearGradient id="kti-bldGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#1a1a2e" />
                    <stop offset="1" stopColor="#0f0f1e" />
                </linearGradient>
                <linearGradient id="kti-bldGradB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#22223e" />
                    <stop offset="1" stopColor="#13132a" />
                </linearGradient>
                <filter id="kti-glowCyan">
                    <feGaussianBlur stdDeviation="2" />
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <pattern id="kti-winPat" x="0" y="0" width="16" height="22" patternUnits="userSpaceOnUse">
                    <rect x="2" y="2" width="12" height="18" fill="#00D9FF" opacity="0.22" rx="1" />
                </pattern>
                <pattern id="kti-winPat2" x="0" y="0" width="18" height="24" patternUnits="userSpaceOnUse">
                    <rect x="2" y="3" width="14" height="18" fill="#00D9FF" opacity="0.18" rx="1" />
                </pattern>
            </defs>

            <rect width="600" height="380" fill="url(#kti-skyGrad)" />

            <path
                d="M0 260 L60 210 L110 240 L160 180 L220 220 L280 170 L340 210 L400 190 L460 230 L520 200 L600 240 L600 280 L0 280 Z"
                fill="#0d0d1c"
                opacity="0.7"
            />
            <path
                d="M0 275 L80 240 L140 260 L200 230 L260 250 L320 225 L380 245 L440 220 L520 245 L600 230 L600 290 L0 290 Z"
                fill="#0a0a18"
                opacity="0.9"
            />

            <rect x="0" y="310" width="600" height="70" fill="#05050A" />
            <line x1="0" y1="340" x2="600" y2="340" stroke="#1a1a2e" strokeWidth="1" />
            <g stroke="#00D9FF" strokeWidth="1" opacity="0.25" strokeDasharray="8 10">
                <line x1="0" y1="355" x2="600" y2="355" />
            </g>

            <g>
                <rect x="80" y="128" width="170" height="182" fill="url(#kti-bldGradA)" stroke="rgba(0,217,255,0.25)" strokeWidth="1" />
                <rect x="76" y="122" width="178" height="9" fill="#0f0f1e" stroke="rgba(0,217,255,0.3)" strokeWidth="1" />
                <rect x="96" y="140" width="138" height="150" fill="url(#kti-winPat)" />
                <rect x="150" y="275" width="30" height="35" fill="#00D9FF" opacity="0.25" />
                <rect x="150" y="275" width="30" height="35" fill="none" stroke="#00D9FF" strokeWidth="1" opacity="0.6" />
                <rect x="86" y="128" width="28" height="16" fill="#00D9FF" opacity="0.9" />
                <text x="100" y="140" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10" fill="#05050A" textAnchor="middle">
                    168A
                </text>
                <text x="165" y="116" fontFamily="Space Grotesk, sans-serif" fontSize="9" fontWeight="700" fill="#00D9FF" textAnchor="middle" opacity="0.85">
                    HIGHER COLLEGE
                </text>
                <rect x="108" y="150" width="114" height="18" fill="#0A0A1E" stroke="#00D9FF" strokeWidth="1" filter="url(#kti-glowCyan)" opacity="0.9" />
                <text x="165" y="162" fontFamily="Space Grotesk" fontSize="10" fontWeight="700" fill="#00D9FF" textAnchor="middle" filter="url(#kti-glowCyan)">
                    KTI · COLLEGE
                </text>
            </g>

            <g>
                <rect x="280" y="158" width="180" height="152" fill="url(#kti-bldGradB)" stroke="rgba(255,0,255,0.25)" strokeWidth="1" />
                <rect x="276" y="152" width="188" height="9" fill="#0f0f1e" stroke="rgba(255,0,255,0.3)" strokeWidth="1" />
                <rect x="296" y="172" width="148" height="118" fill="url(#kti-winPat2)" />
                <rect x="355" y="275" width="30" height="35" fill="#FF00FF" opacity="0.28" />
                <rect x="355" y="275" width="30" height="35" fill="none" stroke="#FF00FF" strokeWidth="1" opacity="0.6" />
                <rect x="286" y="158" width="28" height="16" fill="#FF00FF" opacity="0.9" />
                <text x="300" y="170" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="10" fill="#05050A" textAnchor="middle">
                    168B
                </text>
                <text x="370" y="146" fontFamily="Space Grotesk, sans-serif" fontSize="9" fontWeight="700" fill="#FF00FF" textAnchor="middle" opacity="0.85">
                    KTI ACADEMY
                </text>
                <rect x="310" y="182" width="120" height="18" fill="#0A0A1E" stroke="#FF00FF" strokeWidth="1" opacity="0.9" />
                <text x="370" y="194" fontFamily="Space Grotesk" fontSize="10" fontWeight="700" fill="#FF00FF" textAnchor="middle">
                    KTI · ACADEMY
                </text>
            </g>

            <g opacity="0.6">
                <line x1="40" y1="300" x2="40" y2="338" stroke="#00D9FF" strokeWidth="1.2" opacity="0.4" />
                <circle cx="40" cy="300" r="3" fill="#00D9FF" opacity="0.7" />
                <line x1="267" y1="300" x2="267" y2="338" stroke="#00D9FF" strokeWidth="1.2" opacity="0.4" />
                <circle cx="267" cy="300" r="3" fill="#00D9FF" opacity="0.7" />
                <line x1="476" y1="300" x2="476" y2="338" stroke="#00D9FF" strokeWidth="1.2" opacity="0.4" />
                <circle cx="476" cy="300" r="3" fill="#00D9FF" opacity="0.7" />
                <line x1="560" y1="300" x2="560" y2="338" stroke="#00D9FF" strokeWidth="1.2" opacity="0.4" />
                <circle cx="560" cy="300" r="3" fill="#00D9FF" opacity="0.7" />
            </g>

            <g transform="translate(552, 32)" opacity="0.6">
                <circle cx="0" cy="0" r="16" fill="none" stroke="#00D9FF" strokeWidth="1" />
                <path d="M0 -12 L4 4 L0 1 L-4 4 Z" fill="#00D9FF" />
                <text x="0" y="-18" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" fill="#00D9FF">
                    N
                </text>
            </g>
        </svg>
    )
}

function CampusSVG() {
    return (
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <defs>
                <pattern id="kti-mapGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,217,255,0.06)" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="1200" height="600" fill="#07070E" />
            <rect width="1200" height="600" fill="url(#kti-mapGrid)" />

            <g stroke="#1a1a2e" strokeWidth="22" fill="none">
                <line x1="0" y1="220" x2="1200" y2="220" />
                <line x1="0" y1="420" x2="1200" y2="420" />
                <line x1="400" y1="0" x2="400" y2="600" />
                <line x1="780" y1="0" x2="780" y2="600" />
            </g>
            <g stroke="rgba(0,217,255,0.18)" strokeWidth="1" strokeDasharray="8 10" fill="none">
                <line x1="0" y1="220" x2="1200" y2="220" />
                <line x1="0" y1="420" x2="1200" y2="420" />
                <line x1="400" y1="0" x2="400" y2="600" />
                <line x1="780" y1="0" x2="780" y2="600" />
            </g>

            <text x="1180" y="215" textAnchor="end" fontFamily="JetBrains Mono" fontSize="11" fill="#00D9FF" opacity="0.75" fontWeight="700">
                ТОЛЕ БИ
            </text>
            <text x="1180" y="415" textAnchor="end" fontFamily="JetBrains Mono" fontSize="11" fill="#00D9FF" opacity="0.75" fontWeight="700">
                ҚАЗЫБЕК БИ
            </text>
            <text
                x="397"
                y="594"
                textAnchor="end"
                fontFamily="JetBrains Mono"
                fontSize="11"
                fill="#00D9FF"
                opacity="0.75"
                fontWeight="700"
                transform="rotate(-90 397 594)"
            >
                БАЙЗАҚОВ
            </text>
            <text
                x="777"
                y="594"
                textAnchor="end"
                fontFamily="JetBrains Mono"
                fontSize="11"
                fill="#00D9FF"
                opacity="0.75"
                fontWeight="700"
                transform="rotate(-90 777 594)"
            >
                МҰРАТБАЕВ
            </text>

            <rect x="555" y="360" width="140" height="78" fill="#12122a" stroke="#00D9FF" strokeWidth="1.5" opacity="0.95" />
            <rect x="558" y="363" width="64" height="72" fill="#1a1a2e" stroke="rgba(0,217,255,0.5)" />
            <rect x="628" y="363" width="64" height="72" fill="#1a1a2e" stroke="rgba(255,0,255,0.5)" />
            <text x="590" y="404" textAnchor="middle" fontFamily="Space Grotesk" fontSize="12" fontWeight="700" fill="#00D9FF">
                168A
            </text>
            <text x="660" y="404" textAnchor="middle" fontFamily="Space Grotesk" fontSize="12" fontWeight="700" fill="#FF00FF">
                168B
            </text>
        </svg>
    )
}

const LANDING_CSS = `
.kti-landing {
  --bg: #05050A;
  --card: rgba(20, 20, 36, 0.6);
  --border: rgba(255, 255, 255, 0.08);
  --border-hi: rgba(255, 255, 255, 0.14);
  --cyan: #00D9FF;
  --magenta: #FF00FF;
  --success: #10B981;
  --amber: #F59E0B;
  --danger: #EF4444;
  --fg1: #FFFFFF;
  --fg2: #E8E8ED;
  --fg3: #94A3B8;
  --fg4: #64748B;
  --glow-cyan: 0 0 12px rgba(0, 217, 255, 0.55), 0 0 28px rgba(0, 217, 255, 0.28);
  --glow-magenta: 0 0 12px rgba(255, 0, 255, 0.55), 0 0 28px rgba(255, 0, 255, 0.28);
  --ff-sans: var(--font-inter), 'Inter', system-ui, sans-serif;
  --ff-display: var(--font-display), 'Space Grotesk', 'Inter', sans-serif;
  --ff-mono: var(--font-mono), 'JetBrains Mono', ui-monospace, monospace;

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--fg2);
  font-family: var(--ff-sans);
  overflow-x: hidden;
}
.kti-landing * { box-sizing: border-box; }
.kti-landing a { color: inherit; text-decoration: none; }
.kti-landing button { font-family: inherit; cursor: pointer; }
.kti-landing img, .kti-landing svg { display: block; }
.kti-landing ::selection { background: var(--cyan); color: #000; }

.kti-landing .grid-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at center top, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center top, black 20%, transparent 80%);
}
.kti-landing .aurora { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.kti-landing .aurora::before,
.kti-landing .aurora::after {
  content: ''; position: absolute; border-radius: 50%;
  filter: blur(120px); mix-blend-mode: screen;
}
.kti-landing .aurora::before { top: -100px; left: -100px; width: 500px; height: 500px; background: var(--cyan); opacity: 0.15; }
.kti-landing .aurora::after { bottom: -150px; right: -100px; width: 600px; height: 600px; background: var(--magenta); opacity: 0.1; }

.kti-landing header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 12px 28px; display: flex; align-items: center; justify-content: space-between;
  background: rgba(5, 5, 10, 0.72);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--border);
  gap: 16px;
}
.kti-landing .logo { display: flex; align-items: center; gap: 12px; }
.kti-landing .logo-mark {
  width: 38px; height: 38px; border-radius: 9px;
  background: linear-gradient(135deg, #0A0A1E, #1a1a3e);
  border: 1px solid rgba(0, 217, 255, 0.4);
  box-shadow: var(--glow-cyan), inset 0 0 12px rgba(0, 217, 255, 0.1);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--ff-display); font-weight: 700; color: var(--cyan); font-size: 15px;
}
.kti-landing .logo-text-wrap { line-height: 1.1; }
.kti-landing .logo-name { font-family: var(--ff-display); font-weight: 700; font-size: 15px; color: #fff; letter-spacing: -0.01em; }
.kti-landing .logo-sub { font-family: var(--ff-mono); font-weight: 500; font-size: 10px; color: var(--cyan); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 1px; }
.kti-landing .logo-dot { color: var(--cyan); }

.kti-landing nav ul { list-style: none; display: flex; gap: 22px; padding: 0; margin: 0; font-size: 13px; font-weight: 500; color: var(--fg3); }
.kti-landing nav a { transition: color 0.2s, text-shadow 0.2s; }
.kti-landing nav a:hover { color: var(--cyan); text-shadow: 0 0 10px rgba(0, 217, 255, 0.6); }
@media (max-width: 1000px) { .kti-landing nav { display: none; } }

.kti-landing .header-right { display: flex; align-items: center; gap: 10px; }
.kti-landing .lang-switch {
  display: flex; gap: 2px; padding: 3px;
  background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border); border-radius: 9px;
}
.kti-landing .lang-switch button {
  background: none; border: none; color: var(--fg3);
  padding: 6px 9px; border-radius: 7px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.kti-landing .lang-switch button.active { background: var(--cyan); color: #05050A; box-shadow: var(--glow-cyan); }
.kti-landing .lang-switch button:not(.active):hover { color: var(--cyan); }

.kti-landing .btn-login {
  padding: 9px 16px; border-radius: 10px;
  background: var(--cyan); color: #05050A;
  font-size: 13px; font-weight: 700; border: none;
  box-shadow: var(--glow-cyan);
  display: inline-flex; align-items: center; gap: 8px;
  transition: transform 0.15s ease;
}
.kti-landing .btn-login:hover { transform: translateY(-1px); }

.kti-landing .ticker {
  position: relative; z-index: 5; margin-top: 62px;
  padding: 9px 0;
  background: linear-gradient(90deg, rgba(0, 217, 255, 0.08), rgba(255, 0, 255, 0.08));
  border-top: 1px solid rgba(0, 217, 255, 0.2);
  border-bottom: 1px solid rgba(255, 0, 255, 0.2);
  overflow: hidden;
}
.kti-landing .ticker-track {
  display: flex; gap: 48px; white-space: nowrap;
  animation: kti-slide 60s linear infinite;
  font-size: 12px; color: var(--fg2); font-weight: 500;
  width: max-content;
}
.kti-landing .ticker-track span { display: inline-flex; align-items: center; gap: 8px; }
.kti-landing .ticker-track b {
  color: var(--cyan); font-family: var(--ff-mono);
  text-shadow: 0 0 6px rgba(0, 217, 255, 0.6);
  margin-left: 4px; font-weight: 700;
}
.kti-landing .ticker-track svg { color: var(--cyan); }
.kti-landing .ticker-sep { color: var(--magenta); }
@keyframes kti-slide {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.kti-landing main { position: relative; z-index: 5; }
.kti-landing .container { max-width: 1320px; margin: 0 auto; padding: 0 28px; }

.kti-landing .hero { position: relative; padding: 48px 0 32px; }
.kti-landing .hero-kicker {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(0, 217, 255, 0.08);
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: var(--cyan);
  font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  text-transform: uppercase; font-family: var(--ff-mono);
}
.kti-landing .hero-kicker .pulse {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
  animation: kti-pulse 1.8s ease-in-out infinite;
}
@keyframes kti-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.3); }
}

.kti-landing .hero-title {
  font-family: var(--ff-display);
  font-size: clamp(36px, 5.4vw, 68px);
  font-weight: 700; line-height: 1.02; letter-spacing: -0.025em;
  margin: 18px 0 14px; color: #fff;
  text-wrap: balance;
}
.kti-landing .hero-title .gradient {
  background: linear-gradient(135deg, #fff 0%, var(--cyan) 45%, var(--magenta) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.kti-landing .hero-sub { color: var(--fg3); font-size: 16px; line-height: 1.55; max-width: 580px; }

.kti-landing .hero-cta { display: flex; gap: 12px; margin-top: 26px; flex-wrap: wrap; }
.kti-landing .btn {
  padding: 12px 20px; border-radius: 12px;
  font-weight: 600; font-size: 13px;
  border: 1px solid transparent;
  display: inline-flex; align-items: center; gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kti-landing .btn.primary {
  background: var(--cyan); color: #05050A;
  border-color: var(--cyan);
  box-shadow: var(--glow-cyan);
}
.kti-landing .btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.9), 0 0 40px rgba(0, 217, 255, 0.4);
}
.kti-landing .btn.ghost {
  background: transparent; color: var(--magenta);
  border-color: var(--magenta);
  box-shadow: inset 0 0 12px rgba(255, 0, 255, 0.15);
}
.kti-landing .btn.ghost:hover { box-shadow: inset 0 0 14px rgba(255, 0, 255, 0.25), var(--glow-magenta); }

.kti-landing .hero-grid {
  display: grid; grid-template-columns: 1.1fr 1.3fr;
  gap: 28px; margin-top: 32px; align-items: stretch;
}
@media (max-width: 1100px) { .kti-landing .hero-grid { grid-template-columns: 1fr; } }
.kti-landing .hero-left { display: flex; flex-direction: column; justify-content: space-between; gap: 26px; }

.kti-landing .live-count {
  margin-top: 26px; padding: 16px; border-radius: 14px;
  background: rgba(20, 20, 36, 0.5);
  border: 1px solid var(--border);
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
}
.kti-landing .live-stat .n {
  font-family: var(--ff-display); font-size: 26px; font-weight: 700;
  color: var(--cyan); text-shadow: 0 0 10px rgba(0, 217, 255, 0.5); line-height: 1;
}
.kti-landing .live-stat .n.mg { color: var(--magenta); text-shadow: 0 0 10px rgba(255, 0, 255, 0.5); }
.kti-landing .live-stat .n.gn { color: var(--success); text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
.kti-landing .live-stat .l { color: var(--fg4); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-top: 5px; }
.kti-landing .live-stat .d { color: var(--fg3); font-size: 11px; margin-top: 2px; }

.kti-landing .building-panel {
  position: relative; border-radius: 22px;
  background: linear-gradient(145deg, rgba(22, 22, 36, 0.8), rgba(10, 10, 20, 0.7));
  border: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 217, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.kti-landing .building-head {
  padding: 16px 20px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border);
  font-family: var(--ff-mono); font-size: 11px;
  color: var(--fg3); letter-spacing: 0.5px; gap: 12px; flex-wrap: wrap;
}
.kti-landing .building-head .addr {
  color: var(--cyan); font-weight: 700; text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
}
.kti-landing .building-head .coord { font-size: 10px; }

.kti-landing .building-svg-wrap {
  position: relative; flex: 1; min-height: 320px;
  background: radial-gradient(ellipse at center bottom, rgba(0, 217, 255, 0.08), transparent 70%), #07070E;
  overflow: hidden;
}
.kti-landing .building-svg-wrap svg { width: 100%; height: 100%; }

.kti-landing .building-hot {
  position: absolute; width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  z-index: 2; transform: translate(-50%, -50%);
}
.kti-landing .building-hot::before {
  content: ''; width: 10px; height: 10px; border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.15), 0 0 14px var(--cyan);
  animation: kti-pulse-ring 2s ease-in-out infinite;
}
.kti-landing .building-hot.mg::before {
  background: var(--magenta);
  box-shadow: 0 0 0 4px rgba(255, 0, 255, 0.15), 0 0 14px var(--magenta);
}
.kti-landing .building-hot .tip {
  position: absolute; bottom: 28px; left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 10, 20, 0.95);
  border: 1px solid rgba(0, 217, 255, 0.4);
  backdrop-filter: blur(12px);
  padding: 8px 12px; border-radius: 10px; white-space: nowrap;
  font-size: 11px; color: #fff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.25);
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s ease;
  font-family: var(--ff-sans);
}
.kti-landing .building-hot .tip b {
  color: var(--cyan); display: block; font-size: 10px;
  letter-spacing: 0.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 1px;
}
.kti-landing .building-hot.mg .tip b { color: var(--magenta); }
.kti-landing .building-hot:hover .tip,
.kti-landing .building-hot:focus-within .tip { opacity: 1; }
@keyframes kti-pulse-ring {
  0%, 100% { box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.15), 0 0 14px var(--cyan); }
  50%      { box-shadow: 0 0 0 10px rgba(0, 217, 255, 0.05), 0 0 22px var(--cyan); }
}

.kti-landing .building-foot {
  padding: 14px 20px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  border-top: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
}
.kti-landing .building-foot .l { font-family: var(--ff-mono); font-size: 9.5px; color: var(--fg4); text-transform: uppercase; letter-spacing: 0.5px; }
.kti-landing .building-foot .v { font-family: var(--ff-display); font-size: 15px; color: #fff; margin-top: 3px; font-weight: 600; }
.kti-landing .building-foot .v b { color: var(--cyan); font-weight: 700; }

.kti-landing section.block { padding: 72px 0; position: relative; }
.kti-landing .sec-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
}
.kti-landing .sec-kicker {
  font-family: var(--ff-mono); font-size: 11px; color: var(--cyan);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;
}
.kti-landing h2 {
  font-family: var(--ff-display); font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 700; color: #fff; margin: 0;
  letter-spacing: -0.02em; line-height: 1.08; max-width: 760px;
}
.kti-landing .sec-sub { color: var(--fg3); font-size: 14.5px; max-width: 560px; margin-top: 8px; }

.kti-landing .specs-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
@media (max-width: 1000px) { .kti-landing .specs-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .kti-landing .specs-grid { grid-template-columns: 1fr; } }
.kti-landing .spec {
  padding: 22px; border-radius: 18px;
  background: rgba(20, 20, 36, 0.5);
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
}
.kti-landing .spec:hover {
  border-color: rgba(0, 217, 255, 0.35);
  transform: translateY(-3px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 217, 255, 0.12);
}
.kti-landing .spec .code { font-family: var(--ff-mono); font-size: 11px; color: var(--cyan); font-weight: 700; letter-spacing: 0.5px; }
.kti-landing .spec-ico {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); margin: 10px 0 14px;
}
.kti-landing .spec h3 { font-family: var(--ff-display); font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 6px; }
.kti-landing .spec .qual { font-size: 12px; color: var(--magenta); font-family: var(--ff-mono); margin-bottom: 10px; }
.kti-landing .spec p { font-size: 12.5px; color: var(--fg3); line-height: 1.55; margin: 0 0 14px; }
.kti-landing .spec .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; }

.kti-landing .pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 999px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.3px;
  font-family: var(--ff-mono);
}
.kti-landing .pill.cyan    { background: rgba(0, 217, 255, 0.12); color: var(--cyan);    border: 1px solid rgba(0, 217, 255, 0.3); }
.kti-landing .pill.magenta { background: rgba(255, 0, 255, 0.12); color: var(--magenta); border: 1px solid rgba(255, 0, 255, 0.3); }
.kti-landing .pill.green   { background: rgba(16, 185, 129, 0.12); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
.kti-landing .pill.amber   { background: rgba(245, 158, 11, 0.12); color: var(--amber);   border: 1px solid rgba(245, 158, 11, 0.3); }

.kti-landing .lang-center-bg {
  background: linear-gradient(180deg, transparent, rgba(255, 0, 255, 0.03) 40%, transparent);
}
.kti-landing .lang-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 900px) { .kti-landing .lang-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .kti-landing .lang-grid { grid-template-columns: 1fr; } }
.kti-landing .lang-card {
  padding: 18px; border-radius: 16px;
  background: linear-gradient(145deg, rgba(20, 20, 36, 0.7), rgba(10, 10, 20, 0.5));
  border: 1px solid var(--border);
  position: relative; overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; gap: 14px; align-items: flex-start;
}
.kti-landing .lang-card:hover {
  border-color: rgba(255, 0, 255, 0.3);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 0, 255, 0.1);
}
.kti-landing .lang-flag {
  width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  font-family: var(--ff-display); font-weight: 700; font-size: 22px;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.06);
  position: relative; overflow: hidden;
}
.kti-landing .lang-body { flex: 1; min-width: 0; }
.kti-landing .lang-body h4 { font-family: var(--ff-display); font-size: 17px; font-weight: 700; color: #fff; margin: 0 0 3px; }
.kti-landing .lang-body .native { font-size: 11px; color: var(--fg4); margin-bottom: 8px; font-family: var(--ff-mono); }
.kti-landing .lang-meta { display: flex; gap: 12px; font-size: 11px; color: var(--fg3); margin-bottom: 8px; flex-wrap: wrap; }
.kti-landing .lang-meta b { color: var(--fg2); font-family: var(--ff-mono); }
.kti-landing .lang-price {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 10px; border-top: 1px dashed rgba(255, 255, 255, 0.08);
}
.kti-landing .lang-price .pr {
  font-family: var(--ff-display); font-weight: 700; color: var(--cyan);
  font-size: 15px; text-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
}
.kti-landing .lang-price .pr span { color: var(--fg4); font-size: 11px; font-weight: 500; margin-left: 3px; }
.kti-landing .lang-price .lvl { font-family: var(--ff-mono); font-size: 10px; color: var(--fg4); letter-spacing: 0.3px; }

.kti-landing .admission { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 900px) { .kti-landing .admission { grid-template-columns: 1fr; } }
.kti-landing .tier { padding: 26px; border-radius: 20px; position: relative; overflow: hidden; }
.kti-landing .tier.bachelor {
  background: linear-gradient(145deg, rgba(0, 217, 255, 0.08), rgba(20, 20, 36, 0.6));
  border: 1px solid rgba(0, 217, 255, 0.3);
}
.kti-landing .tier.master {
  background: linear-gradient(145deg, rgba(255, 0, 255, 0.08), rgba(20, 20, 36, 0.6));
  border: 1px solid rgba(255, 0, 255, 0.3);
}
.kti-landing .tier h3 { font-family: var(--ff-display); font-size: 24px; font-weight: 700; color: #fff; margin: 10px 0 6px; }
.kti-landing .tier .t-sub { color: var(--fg3); font-size: 13px; margin-bottom: 18px; }
.kti-landing .tier ul { list-style: none; padding: 0; margin: 0 0 18px; }
.kti-landing .tier li {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 0;
  border-top: 1px dashed rgba(255, 255, 255, 0.07);
  font-size: 13px; color: var(--fg2);
}
.kti-landing .tier li::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--cyan); box-shadow: 0 0 6px var(--cyan);
  margin-top: 7px; flex-shrink: 0;
}
.kti-landing .tier.master li::before { background: var(--magenta); box-shadow: 0 0 6px var(--magenta); }

.kti-landing .campus-wrap {
  position: relative; aspect-ratio: 16/8; border-radius: 22px; overflow: hidden;
  background: #07070E; border: 1px solid var(--border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}
.kti-landing .campus-wrap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.kti-landing .pin { position: absolute; transform: translate(-50%, -50%); }
.kti-landing .pin .dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2), 0 0 16px var(--cyan);
  animation: kti-pulse-ring 2s ease-in-out infinite;
}
.kti-landing .pin .tip {
  position: absolute; bottom: 22px; left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 10, 20, 0.95);
  border: 1px solid rgba(0, 217, 255, 0.4);
  backdrop-filter: blur(14px);
  padding: 8px 12px; border-radius: 10px; white-space: nowrap;
  font-size: 11.5px; color: #fff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.25);
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s ease;
}
.kti-landing .pin .tip b {
  color: var(--cyan); display: block; font-size: 10px;
  letter-spacing: 0.3px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px;
}
.kti-landing .pin:hover .tip { opacity: 1; }
.kti-landing .pin.mg .dot { background: var(--magenta); box-shadow: 0 0 0 3px rgba(255, 0, 255, 0.2), 0 0 16px var(--magenta); }
.kti-landing .pin.gn .dot { background: var(--success); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2), 0 0 16px var(--success); }

.kti-landing .bus-section { margin-top: 18px; }
.kti-landing .bus-title {
  font-family: var(--ff-mono); font-size: 11px;
  color: var(--fg4); text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 10px;
}
.kti-landing .bus-strip { display: flex; gap: 8px; flex-wrap: wrap; }
.kti-landing .bus-chip {
  padding: 6px 12px; border-radius: 10px;
  background: rgba(20, 20, 36, 0.6); border: 1px solid var(--border);
  font-family: var(--ff-mono); font-size: 11px; color: var(--fg2);
  font-weight: 600; letter-spacing: 0.3px;
  display: inline-flex; align-items: center; gap: 6px;
}
.kti-landing .bus-chip .bus-t { color: var(--fg4); }
.kti-landing .bus-chip .num { color: var(--cyan); text-shadow: 0 0 6px rgba(0, 217, 255, 0.5); }
.kti-landing .bus-chip.trolley .num { color: var(--magenta); text-shadow: 0 0 6px rgba(255, 0, 255, 0.5); }

.kti-landing footer { padding: 56px 0 36px; border-top: 1px solid var(--border); margin-top: 48px; position: relative; z-index: 5; }
.kti-landing .foot-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 36px; }
@media (max-width: 800px) { .kti-landing .foot-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .kti-landing .foot-grid { grid-template-columns: 1fr; } }
.kti-landing .foot-logo { margin-bottom: 14px; }
.kti-landing .foot-about { color: var(--fg3); font-size: 13px; line-height: 1.6; max-width: 340px; }
.kti-landing footer h5 {
  font-family: var(--ff-display); font-size: 12px; font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 14px;
}
.kti-landing .foot-list { padding: 0; margin: 0; list-style: none; }
.kti-landing .foot-list li { margin-bottom: 8px; font-size: 13px; color: var(--fg3); }
.kti-landing footer .meta { color: var(--fg4); font-size: 12px; margin-top: 14px; font-family: var(--ff-mono); }
.kti-landing .contact-row {
  display: flex; gap: 8px; align-items: center;
  margin-bottom: 6px; font-size: 13px; color: var(--fg2);
}
.kti-landing .contact-row svg { color: var(--cyan); flex-shrink: 0; }
.kti-landing .contact-link { transition: color 0.15s ease; }
.kti-landing .contact-link:hover { color: var(--cyan); }
.kti-landing .contact-indent { padding-left: 22px; color: var(--fg3); margin-top: -4px; }
.kti-landing .contact-gap { margin-top: 12px; }

.kti-landing :focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
  border-radius: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .kti-landing .ticker-track,
  .kti-landing .hero-kicker .pulse,
  .kti-landing .building-hot::before,
  .kti-landing .pin .dot { animation: none !important; }
  .kti-landing * { transition-duration: 1ms !important; }
}
`
