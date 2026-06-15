'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import styles                                from './login.module.css';

// ── CAPTCHA generator ────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function makeCaptcha(len = 6) {
  return Array.from({ length: len }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}

export default function LoginPage() {
  const router = useRouter();

  // ── tabs ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('corporate'); // 'corporate' | 'debit'

  // ── form fields ───────────────────────────────────────────────────────
  const [userId,    setUserId]    = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode,  setCaptchaCode]  = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // ── state ─────────────────────────────────────────────────────────────
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [fieldErr,  setFieldErr]  = useState({});

  // Generate captcha on mount and on refresh
  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(makeCaptcha());
    setCaptchaInput('');
  }, []);

  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);

  // ── validation ────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!userId.trim())      errs.userId   = 'User ID is required.';
    if (!password)           errs.password = 'Password is required.';
    if (!captchaInput.trim()) errs.captcha = 'Please enter the CAPTCHA.';
    else if (captchaInput.trim() !== captchaCode)
                             errs.captcha  = 'CAPTCHA does not match. Try again.';
    if (!confirmed)          errs.confirm  = 'Please confirm your credentials.';
    return errs;
  }

  // ── submit ────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErr(errs);
      if (errs.captcha) refreshCaptcha();
      return;
    }
    setFieldErr({});
    setLoading(true);

    try {
      const res  = await fetch('/api/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: userId.trim(), password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Login failed.');
        refreshCaptcha();
        setLoading(false);
        return;
      }

      // ── Store customer in sessionStorage for next pages ───────────────
      sessionStorage.setItem('odCustomer', JSON.stringify(data.customer));

      // ── Route based on eligibility ────────────────────────────────────
      if (data.customer.eligible) {
        router.push('/offer');          // Page 3 — offer details
      } else {
        router.push('/not-eligible');   // No offer page
      }

    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoGroup}>
            <div className={styles.logoICICI}>
              <span className={styles.logoCircle}>i</span>
              <span className={styles.logoBank}>ICICI Bank</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.logoDropline}>
              <span className={styles.dlText}>Dropline</span>
              <span className={styles.odBadge}>OD</span>
              <span className={styles.unsecBadge}>Unsecured</span>
            </div>
          </div>

          {/* Progress bar — step 2 of 6 */}
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '20%' }}></div>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFillGray}></div>
            </div>
          </div>
        </div>
      </header>

      {/* ── RED BACKGROUND ─────────────────────────────────────────────── */}
      <div className={styles.bg}>

        {/* ── WHITE CARD ───────────────────────────────────────────────── */}
        <div className={styles.card}>

          {/* Back button */}
          <button className={styles.backBtn} onClick={() => router.push('/')}>
            <span className={styles.backChevron}>‹</span> Back
          </button>

          {/* Title */}
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>
              Apply for <span className={styles.titleOrange}>Dropline OD</span>
            </h1>
            <div className={styles.tagline}>
              <span>🤝 Easy</span>
              <span className={styles.pipe}>|</span>
              <span>⚡ Quick</span>
              <span className={styles.pipe}>|</span>
              <span>🛡 Secure</span>
            </div>
          </div>

          {/* ── TABS ─────────────────────────────────────────────────── */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'corporate' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('corporate'); setError(''); setFieldErr({}); }}
            >
              Corporate Internet Banking
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'debit' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('debit'); setError(''); setFieldErr({}); }}
            >
              Debit Card
            </button>
          </div>

          {/* ── CORPORATE INTERNET BANKING FORM ──────────────────────── */}
          {activeTab === 'corporate' && (
            <form onSubmit={handleLogin} noValidate>

              {/* Global error */}
              {error && (
                <div className={styles.globalError}>
                  ⚠ {error}
                </div>
              )}

              {/* Row 1: User ID + Password */}
              <div className={styles.row}>
                {/* User ID */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Customer ID / User ID <span className={styles.req}>*</span>
                  </label>
                  <div className={`${styles.inputWrap} ${fieldErr.userId ? styles.inputError : ''}`}>
                    <span className={styles.inputIcon}>👤</span>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter Customer ID / User ID"
                      value={userId}
                      onChange={e => { setUserId(e.target.value); setFieldErr(p => ({...p, userId: ''})); }}
                      autoComplete="username"
                    />
                  </div>
                  {fieldErr.userId && <p className={styles.fieldErrMsg}>{fieldErr.userId}</p>}
                </div>

                {/* Password */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Password <span className={styles.req}>*</span>
                  </label>
                  <div className={`${styles.inputWrap} ${fieldErr.password ? styles.inputError : ''}`}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="Enter Password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setFieldErr(p => ({...p, password: ''})); }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPwd(v => !v)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                  {fieldErr.password && <p className={styles.fieldErrMsg}>{fieldErr.password}</p>}
                </div>
              </div>

              {/* Row 2: CAPTCHA */}
              <div className={styles.captchaSection}>
                <label className={styles.label}>
                  CAPTCHA <span className={styles.req}>*</span>
                </label>
                <div className={styles.captchaRow}>
                  {/* Input */}
                  <div className={`${styles.inputWrap} ${styles.captchaInput} ${fieldErr.captcha ? styles.inputError : ''}`}>
                    <span className={styles.inputIcon}>🛡</span>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter CAPTCHA"
                      value={captchaInput}
                      onChange={e => { setCaptchaInput(e.target.value); setFieldErr(p => ({...p, captcha: ''})); }}
                      maxLength={6}
                      autoComplete="off"
                    />
                  </div>

                  {/* Refresh button */}
                  <button
                    type="button"
                    className={styles.refreshBtn}
                    onClick={refreshCaptcha}
                    title="Refresh CAPTCHA"
                  >
                    ↻
                  </button>

                  {/* CAPTCHA display */}
                  <div className={styles.captchaDisplay} aria-hidden="true">
                    <CaptchaRenderer code={captchaCode} />
                  </div>
                </div>
                {fieldErr.captcha && <p className={styles.fieldErrMsg}>{fieldErr.captcha}</p>}
              </div>

              {/* Confirm checkbox */}
              <div className={styles.confirmRow}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={confirmed}
                    onChange={e => { setConfirmed(e.target.checked); setFieldErr(p => ({...p, confirm: ''})); }}
                  />
                  <span className={styles.checkText}>
                    <em>I confirm that the credentials mentioned above are correct.</em>
                  </span>
                </label>
                {fieldErr.confirm && <p className={styles.fieldErrMsg}>{fieldErr.confirm}</p>}
              </div>

              {/* Login button */}
              <button
                type="submit"
                className={styles.loginBtn}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <>Login <span className={styles.loginArrow}>›</span></>
                )}
              </button>

              {/* Forgot password */}
              <div className={styles.forgotWrap}>
                <button
                  type="button"
                  className={styles.forgotBtn}
                  onClick={() => alert('Forgot Password — Email OTP feature coming soon.')}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Security note */}
              <div className={styles.secNote}>
                <span className={styles.secIcon}>🛡</span>
                <span>Your information is secure with us. We use advanced encryption to protect your data.</span>
              </div>

            </form>
          )}

          {/* ── DEBIT CARD TAB — placeholder ─────────────────────────── */}
          {activeTab === 'debit' && (
            <div className={styles.comingSoon}>
              <div className={styles.comingSoonIcon}>💳</div>
              <p className={styles.comingSoonText}>Debit Card login coming soon.</p>
              <p className={styles.comingSoonSub}>Please use Corporate Internet Banking for now.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── CAPTCHA Canvas Renderer ───────────────────────────────────────────────
function CaptchaRenderer({ code }) {
  // Render CAPTCHA as styled text with noise (no canvas needed)
  const chars = code.split('');
  const colors = ['#C62828', '#1565C0', '#2E7D32', '#6A1B9A', '#E65100', '#1a1a1a'];
  const rotations = [-15, 8, -5, 12, -10, 6];
  const sizes = [22, 20, 24, 19, 22, 21];

  return (
    <div className={styles.captchaChars}>
      {chars.map((ch, i) => (
        <span
          key={i}
          style={{
            color:     colors[i % colors.length],
            transform: `rotate(${rotations[i % rotations.length]}deg)`,
            fontSize:  `${sizes[i % sizes.length]}px`,
            fontWeight: 800,
            fontFamily: i % 2 === 0 ? 'Georgia, serif' : 'Arial, sans-serif',
            display: 'inline-block',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}