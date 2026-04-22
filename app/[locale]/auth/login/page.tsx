'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname, Link } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import {
    User,
    BookOpen,
    Users,
    Shield,
    AtSign,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check,
} from 'lucide-react'

type Role = 'student' | 'teacher' | 'parent' | 'admin'

const ROLE_ORDER: Role[] = ['student', 'teacher', 'parent', 'admin']

// Matches scripts/seed.ts — students use transliterated Kazakh names @demo.edu.
// Parent/admin roles are not seeded; those buttons will surface an "invalid
// credentials" error until those accounts are created manually.
const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
    student: { email: 'aidar.alimov@demo.edu', password: 'demo12345' },
    teacher: { email: 'teacher@demo.edu', password: 'demo12345' },
    parent: { email: 'parent@demo.edu', password: 'demo12345' },
    admin: { email: 'admin@demo.edu', password: 'demo12345' },
}

const USING_REAL_BACKEND =
    typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_SUPABASE_URL

export default function LoginPage() {
    const t = useTranslations('auth.login')
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const { signIn, refreshUser } = useAuth()

    const [role, setRole] = useState<Role>('student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [remember, setRemember] = useState(true)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success'>('idle')
    const [error, setError] = useState<string>('')

    // Prevent setState calls on unmounted component during the post-success timeout.
    const mountedRef = useRef(true)
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const changeLocale = (next: 'ru' | 'kk') => {
        if (next === locale) return
        router.replace(pathname, { locale: next })
    }

    const handleQuickFill = (r: Role) => {
        const creds = DEMO_CREDENTIALS[r]
        setRole(r)
        setEmail(creds.email)
        setPassword(creds.password)
        // Clear any stale auth error so the user does not see "invalid credentials"
        // alongside freshly filled demo credentials.
        setError('')
    }

    const performSignIn = async (creds: { email: string; password: string }) => {
        setLoading(true)
        setError('')
        try {
            const { error: signInError } = await signIn(creds.email, creds.password)
            if (signInError) throw signInError
            if (!mountedRef.current) return
            setStatus('success')
            setTimeout(() => {
                if (!mountedRef.current) return
                // refreshUser is fire-and-forget; AuthProvider's onAuthStateChange is
                // the authoritative sync path, so we don't need to await or error-handle here.
                refreshUser()
                router.push('/')
            }, 400)
        } catch (err: unknown) {
            if (!mountedRef.current) return
            // Distinguish network / fetch failures from credential rejections so the
            // user is not told "invalid credentials" when the server is unreachable.
            const isNetworkError =
                err instanceof TypeError ||
                (err instanceof Error && err.message.toLowerCase().includes('fetch'))
            setError(isNetworkError ? t('errors.network') : t('errors.invalid'))
            setLoading(false)
        }
        // Note: loading intentionally stays true on success — component will unmount
        // on navigation. A finally { setLoading(false) } would flash the idle button
        // state during the 400 ms success animation. Leave as-is.
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (loading || status === 'success') return
        if (!email.trim() || !password) {
            setError(t('errors.empty'))
            return
        }
        await performSignIn({ email: email.trim(), password })
    }

    const submitDisabled = loading || status === 'success'
    const rolePreviewClass: Record<Role, string> = {
        student: 'rp',
        teacher: 'rp mg',
        parent: 'rp gn',
        admin: 'rp am',
    }

    return (
        <div className="kti-login">
            <style precedence="default">{LOGIN_CSS}</style>

            <div className="grid-bg" aria-hidden="true" />
            <div className="aurora" aria-hidden="true" />

            <header>
                <div className="logo">
                    <div className="logo-mark">K</div>
                    <div>
                        <div className="logo-name">{t('brand')}</div>
                        <div className="logo-sub">{t('brandSub')}</div>
                    </div>
                </div>
                <div className="top-right">
                    <div className="lang-mini" role="group" aria-label={t('a11y.langSwitch')}>
                        <button
                            type="button"
                            className={locale === 'kk' ? 'on' : ''}
                            onClick={() => changeLocale('kk')}
                        >
                            KZ
                        </button>
                        <button
                            type="button"
                            className={locale === 'ru' ? 'on' : ''}
                            onClick={() => changeLocale('ru')}
                        >
                            RU
                        </button>
                    </div>
                    <Link className="back-btn" href="/">
                        <ArrowLeft size={14} strokeWidth={1.8} />
                        <span>{t('backToSite')}</span>
                    </Link>
                </div>
            </header>

            <main>
                <section className="illus">
                    <div className="kicker">
                        <span className="dot" />
                        <span>{t('kicker')}</span>
                    </div>
                    <h1>
                        {t('welcomeLead')}
                        <br />
                        <span className="grad">{t('welcomeBrand')}</span>
                    </h1>
                    <p>{t('welcomeSub')}</p>
                    <div className="role-preview">
                        {ROLE_ORDER.map((r) => (
                            <div key={r} className={rolePreviewClass[r]}>
                                <div className="ic">
                                    <RoleIcon role={r} size={18} />
                                </div>
                                <div>
                                    <div className="t">{t(`rolePreviews.${r}.title`)}</div>
                                    <div className="s">{t(`rolePreviews.${r}.sub`)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <form className="login-card" onSubmit={handleSubmit} autoComplete="on" noValidate>
                    <span className={`api-chip${USING_REAL_BACKEND ? '' : ' dev'}`}>
                        <span className="dot" />
                        {USING_REAL_BACKEND ? 'PROD · supabase' : 'DEV · mock'}
                    </span>

                    <h2>{t('title')}</h2>
                    <div className="sub">{t('subtitle')}</div>

                    <div className="role-tabs" role="tablist" aria-label={t('a11y.roleTabs')}>
                        {ROLE_ORDER.map((r) => (
                            <button
                                key={r}
                                type="button"
                                role="tab"
                                aria-selected={role === r}
                                className={`role-tab${role === r ? ' on' : ''}`}
                                data-role={r}
                                onClick={() => setRole(r)}
                            >
                                <RoleIcon role={r} size={16} />
                                <span>{t(`roles.${r}`)}</span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="error" role="alert">
                            <AlertCircle size={14} strokeWidth={1.8} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="kti-email">{t('emailLabel')}</label>
                        <div className="input-wrap">
                            <AtSign size={16} strokeWidth={1.8} className="input-icon" />
                            <input
                                id="kti-email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('emailPlaceholder')}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="kti-password">{t('passwordLabel')}</label>
                        <div className="input-wrap">
                            <Lock size={16} strokeWidth={1.8} className="input-icon" />
                            <input
                                id="kti-password"
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="eye"
                                onClick={() => setShowPass((v) => !v)}
                                aria-label={
                                    showPass ? t('a11y.hidePassword') : t('a11y.showPassword')
                                }
                            >
                                {showPass ? (
                                    <EyeOff size={16} strokeWidth={1.8} />
                                ) : (
                                    <Eye size={16} strokeWidth={1.8} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        <label className="remember">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <span>{t('remember')}</span>
                        </label>
                        <a href="#">{t('forgot')}</a>
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        data-role={role}
                        disabled={submitDisabled}
                    >
                        {status === 'success' ? (
                            <>
                                <Check size={16} strokeWidth={2.2} />
                                <span>OK</span>
                            </>
                        ) : loading ? (
                            <>
                                <Loader2 size={16} strokeWidth={2} className="spin" />
                                <span>{t('loading')}</span>
                            </>
                        ) : (
                            <>
                                <span>{t('submit')}</span>
                                <ArrowRight size={16} strokeWidth={2} />
                            </>
                        )}
                    </button>

                    <div className="divider">
                        <span>{t('demoTitle')}</span>
                    </div>

                    <div className="demo">
                        <div className="demo-pick">
                            <b>{t('demoPick')}</b>
                        </div>
                        <div className="demo-quick-row">
                            {ROLE_ORDER.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    className="quick"
                                    onClick={() => handleQuickFill(r)}
                                    disabled={loading}
                                >
                                    {t(`roles.${r}`)}
                                </button>
                            ))}
                        </div>
                        <div className="demo-hint">
                            {t('demoHintPrefix')} <b>demo12345</b>
                        </div>
                    </div>

                    <div className="help">
                        {t('help')} · <span className="mono">+7 (727) 379-78-94</span>
                    </div>
                </form>
            </main>
        </div>
    )
}

function RoleIcon({ role, size }: { role: Role; size: number }) {
    const props = { size, strokeWidth: 1.8 }
    if (role === 'teacher') return <BookOpen {...props} />
    if (role === 'parent') return <Users {...props} />
    if (role === 'admin') return <Shield {...props} />
    return <User {...props} />
}

const LOGIN_CSS = `
.kti-login {
  --bg: #05050A;
  --fg1: #fff;
  --fg2: #E8E8ED;
  --fg3: #94A3B8;
  --fg4: #64748B;
  --cyan: #00D9FF;
  --magenta: #FF00FF;
  --success: #10B981;
  --amber: #F59E0B;
  --border: rgba(255, 255, 255, 0.08);
  --card: rgba(20, 20, 36, 0.6);
  --glow: 0 0 12px rgba(0, 217, 255, 0.55), 0 0 28px rgba(0, 217, 255, 0.28);
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
.kti-login * { box-sizing: border-box; }
.kti-login a { color: var(--cyan); text-decoration: none; }
.kti-login .mono { font-family: var(--ff-mono); }

.kti-login .grid-bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 217, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 217, 255, 0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse at center, black 10%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 10%, transparent 75%);
}
.kti-login .aurora { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.kti-login .aurora::before,
.kti-login .aurora::after {
  content: ''; position: absolute; border-radius: 50%;
  filter: blur(130px); mix-blend-mode: screen;
}
.kti-login .aurora::before {
  top: -150px; left: -100px; width: 520px; height: 520px;
  background: var(--cyan); opacity: 0.18;
}
.kti-login .aurora::after {
  bottom: -180px; right: -120px; width: 600px; height: 600px;
  background: var(--magenta); opacity: 0.12;
}

.kti-login header {
  position: relative; z-index: 5;
  padding: 20px 32px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 16px; flex-wrap: wrap;
}
.kti-login .logo { display: flex; align-items: center; gap: 12px; }
.kti-login .logo-mark {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #0A0A1E, #1a1a3e);
  border: 1px solid rgba(0, 217, 255, 0.4);
  box-shadow: var(--glow);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--ff-display); font-weight: 700; color: var(--cyan); font-size: 16px;
}
.kti-login .logo-name { font-family: var(--ff-display); font-weight: 700; color: #fff; font-size: 15px; }
.kti-login .logo-sub { font-family: var(--ff-mono); font-size: 10px; color: var(--cyan); text-transform: uppercase; letter-spacing: 1.5px; }

.kti-login .top-right { display: flex; gap: 10px; align-items: center; }
.kti-login .lang-mini {
  display: flex; gap: 2px; padding: 3px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border); border-radius: 9px;
}
.kti-login .lang-mini button {
  background: none; border: none; color: var(--fg3);
  padding: 5px 10px; border-radius: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s ease, color 0.15s ease;
}
.kti-login .lang-mini button.on { background: var(--cyan); color: #05050A; }
.kti-login .lang-mini button:not(.on):hover { color: var(--cyan); }

.kti-login .back-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border); border-radius: 10px;
  color: var(--fg3); font-size: 12px; font-weight: 500;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.kti-login .back-btn:hover { border-color: var(--cyan); color: var(--cyan); }

.kti-login main {
  position: relative; z-index: 5;
  display: grid; grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 80px);
  align-items: center;
  max-width: 1280px; margin: 0 auto;
  padding: 0 32px 40px; gap: 48px;
}
@media (max-width: 900px) {
  .kti-login main { grid-template-columns: 1fr; }
  .kti-login .illus { display: none; }
  .kti-login .login-card { justify-self: center !important; }
}

.kti-login .illus { position: relative; }
.kti-login .illus .kicker {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(0, 217, 255, 0.08);
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: var(--cyan);
  font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
  font-family: var(--ff-mono);
}
.kti-login .illus .kicker .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
  animation: kti-pulse 1.8s infinite;
}
.kti-login .illus h1 {
  font-family: var(--ff-display);
  font-size: clamp(32px, 3.8vw, 48px);
  font-weight: 700; color: #fff; line-height: 1.05; letter-spacing: -0.02em;
  margin: 14px 0 10px;
}
.kti-login .illus h1 .grad {
  background: linear-gradient(135deg, #fff, var(--cyan) 50%, var(--magenta));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.kti-login .illus p { color: var(--fg3); font-size: 15px; line-height: 1.6; max-width: 460px; }

.kti-login .role-preview {
  margin-top: 28px; display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 10px; max-width: 460px;
}
.kti-login .rp {
  padding: 14px; border-radius: 14px;
  background: var(--card); border: 1px solid var(--border);
  display: flex; gap: 12px; align-items: center;
}
.kti-login .rp .ic {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); flex-shrink: 0;
}
.kti-login .rp.mg .ic { background: rgba(255, 0, 255, 0.1); border-color: rgba(255, 0, 255, 0.3); color: var(--magenta); }
.kti-login .rp.gn .ic { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: var(--success); }
.kti-login .rp.am .ic { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: var(--amber); }
.kti-login .rp .t { font-family: var(--ff-display); font-weight: 700; font-size: 13px; color: #fff; }
.kti-login .rp .s { font-size: 11px; color: var(--fg4); margin-top: 1px; font-family: var(--ff-mono); }

.kti-login .login-card {
  position: relative; overflow: hidden;
  background: rgba(20, 20, 36, 0.6);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 20px;
  padding: 32px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 0 50px rgba(0, 217, 255, 0.08);
  max-width: 460px; width: 100%;
  justify-self: end;
}
.kti-login .login-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--magenta), transparent);
  opacity: 0.6;
}
.kti-login .login-card h2 {
  font-family: var(--ff-display); font-weight: 700; font-size: 24px; color: #fff;
  margin: 0 0 6px; letter-spacing: -0.01em;
}
.kti-login .login-card .sub { color: var(--fg3); font-size: 13px; margin-bottom: 22px; }

.kti-login .role-tabs {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border); border-radius: 12px;
  margin-bottom: 22px;
}
.kti-login .role-tab {
  background: none; border: none; color: var(--fg3);
  padding: 10px 8px; border-radius: 9px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.2px;
  cursor: pointer; font-family: inherit;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.kti-login .role-tab:not(.on):hover { color: #fff; background: rgba(255, 255, 255, 0.03); }
.kti-login .role-tab.on[data-role='student'] { background: var(--cyan); color: #05050A; box-shadow: 0 0 12px rgba(0, 217, 255, 0.4); }
.kti-login .role-tab.on[data-role='teacher'] { background: var(--magenta); color: #05050A; box-shadow: 0 0 12px rgba(255, 0, 255, 0.4); }
.kti-login .role-tab.on[data-role='parent'] { background: var(--success); color: #05050A; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
.kti-login .role-tab.on[data-role='admin'] { background: var(--amber); color: #05050A; box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); }

.kti-login .field { margin-bottom: 14px; }
.kti-login .field label {
  display: block; font-size: 11px; font-weight: 600; color: var(--fg3);
  letter-spacing: 0.4px; text-transform: uppercase;
  font-family: var(--ff-mono); margin-bottom: 6px;
}
.kti-login .input-wrap { position: relative; display: block; }
.kti-login .input-wrap .input-icon {
  position: absolute; top: 50%; left: 13px; transform: translateY(-50%);
  color: var(--fg4); pointer-events: none;
}
.kti-login .input-wrap .eye {
  position: absolute; top: 50%; right: 8px; transform: translateY(-50%);
  background: none; border: none; color: var(--fg4);
  cursor: pointer; padding: 6px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: color 0.15s ease;
}
.kti-login .input-wrap .eye:hover { color: var(--cyan); }
.kti-login .input-wrap .eye:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
.kti-login .input-wrap input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border); border-radius: 10px;
  color: #fff; padding: 11px 40px 11px 38px;
  font-size: 14px; outline: none; font-family: inherit;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}
.kti-login .input-wrap input::placeholder { color: var(--fg4); }
.kti-login .input-wrap input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.15);
  background: rgba(0, 217, 255, 0.04);
}

.kti-login .row {
  display: flex; justify-content: space-between; align-items: center;
  margin: 12px 0 18px; font-size: 12px;
}
.kti-login .remember {
  display: flex; align-items: center; gap: 7px;
  color: var(--fg3); cursor: pointer; user-select: none;
}
.kti-login .remember input { accent-color: var(--cyan); }

.kti-login .btn-submit {
  width: 100%; padding: 13px; border-radius: 12px;
  background: var(--cyan); color: #05050A;
  font-size: 14px; font-weight: 700;
  border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: inherit; box-shadow: var(--glow);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.kti-login .btn-submit:hover:not(:disabled) { transform: translateY(-1px); }
.kti-login .btn-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.kti-login .btn-submit:disabled { opacity: 0.7; cursor: wait; }
.kti-login .btn-submit[data-role='teacher'] { background: var(--magenta); box-shadow: 0 0 12px rgba(255, 0, 255, 0.55), 0 0 28px rgba(255, 0, 255, 0.28); }
.kti-login .btn-submit[data-role='parent']  { background: var(--success); box-shadow: 0 0 12px rgba(16, 185, 129, 0.55), 0 0 28px rgba(16, 185, 129, 0.28); }
.kti-login .btn-submit[data-role='admin']   { background: var(--amber);   box-shadow: 0 0 12px rgba(245, 158, 11, 0.55), 0 0 28px rgba(245, 158, 11, 0.28); }

.kti-login .divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0 14px;
  color: var(--fg4); font-family: var(--ff-mono);
  font-size: 10px; letter-spacing: 0.5px; white-space: nowrap;
}
.kti-login .divider::before,
.kti-login .divider::after {
  content: ''; flex: 1 1 auto; min-width: 24px; height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.kti-login .demo {
  padding: 12px 14px; border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px dashed rgba(0, 217, 255, 0.3);
  font-family: var(--ff-mono); font-size: 11px; color: var(--fg3);
  line-height: 1.6;
}
.kti-login .demo b { color: var(--cyan); font-weight: 700; }
.kti-login .demo-pick { margin-bottom: 6px; }
.kti-login .demo-quick-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
.kti-login .quick {
  padding: 3px 8px; border-radius: 6px;
  background: rgba(0, 217, 255, 0.08); color: var(--cyan);
  border: 1px solid rgba(0, 217, 255, 0.25);
  cursor: pointer; font-weight: 600; font-family: inherit; font-size: 11px;
  transition: background 0.15s ease, color 0.15s ease;
}
.kti-login .quick:hover:not(:disabled) { background: var(--cyan); color: #05050A; }
.kti-login .quick:disabled { opacity: 0.5; cursor: not-allowed; }
.kti-login .demo-hint { color: var(--fg4); }

.kti-login .help { text-align: center; font-size: 12px; color: var(--fg4); margin-top: 18px; }

.kti-login .error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5; border-radius: 10px;
  padding: 10px 12px; font-size: 12px; margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}

.kti-login .api-chip {
  position: absolute; top: 16px; right: 16px;
  padding: 4px 9px; border-radius: 999px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: var(--success);
  font-family: var(--ff-mono); font-size: 9.5px; font-weight: 700;
  letter-spacing: 0.5px; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 5px;
}
.kti-login .api-chip.dev {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.35);
  color: var(--amber);
}
.kti-login .api-chip .dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: currentColor; box-shadow: 0 0 6px currentColor;
}

.kti-login .spin { animation: kti-spin 1s linear infinite; }

@keyframes kti-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes kti-spin  { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .kti-login .illus .kicker .dot,
  .kti-login .spin { animation: none !important; }
  .kti-login * { transition-duration: 1ms !important; }
}
`
