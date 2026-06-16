'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter }                         from 'next/navigation';
import styles                                from './offer-details.module.css';

// ── Constants (same for everyone) ────────────────────────────────────────
const TENURE_MONTHS  = 12;
const VALIDITY       = '1 Year';
const INTEREST_RATE  = 16.9;
const PROCESSING_FEE = 2.00;
const MIN_AMOUNT     = 100000;   // ₹1,00,000
const STEP           = 1000;     // slider steps of ₹1000

// ── Application Number generator ─────────────────────────────────────────
function generateAppNumber() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CAODE0${num}`;
}

// ── Format ₹ in Indian system ─────────────────────────────────────────────
function formatINR(num) {
  return Number(num).toLocaleString('en-IN');
}

export default function OfferDetailsPage() {
  const router = useRouter();

  // ── Session data ──────────────────────────────────────────────────────
  const [customer,   setCustomer]   = useState(null);
  const [appNumber,  setAppNumber]  = useState('');

  // ── Slider state ──────────────────────────────────────────────────────
  const [selectedAmount, setSelectedAmount] = useState(MIN_AMOUNT);

  useEffect(() => {
    const stored = sessionStorage.getItem('odCustomer');
    if (!stored) { router.push('/'); return; }

    const c = JSON.parse(stored);
    setCustomer(c);

    // Set slider default to max (offer amount from DB), capped at ₹50L
    const maxAmt = Math.min(c.offerAmount || MIN_AMOUNT, 5000000);
    setSelectedAmount(maxAmt);

    // Generate or reuse application number
    let appNum = sessionStorage.getItem('appNumber');
    if (!appNum) {
      appNum = generateAppNumber();
      sessionStorage.setItem('appNumber', appNum);
    }
    setAppNumber(appNum);
  }, [router]);

  // ── Derived values ────────────────────────────────────────────────────
  const maxAmount   = customer ? Math.min(customer.offerAmount || MIN_AMOUNT, 5000000) : MIN_AMOUNT;
  const sliderRange = maxAmount - MIN_AMOUNT;
  const fillPct     = sliderRange > 0
    ? ((selectedAmount - MIN_AMOUNT) / sliderRange) * 100
    : 0;

  function handleSlider(e) {
    const raw     = parseInt(e.target.value, 10);
    const rounded = Math.round(raw / STEP) * STEP;
    setSelectedAmount(rounded);
  }

  // ── Continue ──────────────────────────────────────────────────────────
  function handleContinue() {
    // Save chosen amount to session for next pages
    const stored = JSON.parse(sessionStorage.getItem('odCustomer') || '{}');
    stored.finalAmount = selectedAmount;
    sessionStorage.setItem('odCustomer', JSON.stringify(stored));
    router.push('/sanction');    // Page 5
  }

  if (!customer) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo */}
          <div className={styles.logoGroup}>
            <div className={styles.logoICICI}>
              <span className={styles.logoCircle}>i</span>
              <span className={styles.logoBank}>ICICI Bank</span>
            </div>
            <div className={styles.headerDivider}></div>
            <div className={styles.logoDropline}>
              <span className={styles.dlText}>Dropline</span>
              <span className={styles.odBadge}>OD</span>
              <span className={styles.unsecBadge}>Unsecured</span>
            </div>
          </div>

          {/* Application number — top right */}
          <div className={styles.appNum}>
            Application Number:&nbsp;
            <span className={styles.appNumValue}>{appNumber}</span>
          </div>
        </div>
      </header>

      {/* ── RED BACKGROUND WRAPPER ────────────────────────────────────── */}
      <div className={styles.bg}>
        <div className={styles.pageInner}>

          {/* Back + title */}
          <div className={styles.topRow}>
            <button className={styles.backBtn} onClick={() => router.push('/policies')}>
              ‹ Back
            </button>
            <div className={styles.titleBlock}>
              <h1 className={styles.pageTitle}>
                Dropline <span className={styles.titleOD}>OD</span>
              </h1>
              <div className={styles.tagline}>
                <span>🤝 Easy</span>
                <span className={styles.pipe}>|</span>
                <span>⚡ Quick</span>
                <span className={styles.pipe}>|</span>
                <span>🛡 Secure</span>
              </div>
            </div>
            <div className={styles.topRowSpacer}></div>
          </div>

          {/* ── CONGRATULATIONS BANNER ─────────────────────────────── */}
          <div className={styles.congoBanner}>
            <span className={styles.congoCheck}>✓</span>
            <p className={styles.congoText}>
              Congratulations! You are eligible for{' '}
              <strong className={styles.congoAmount}>
                ₹ {formatINR(customer.offerAmount)}
              </strong>{' '}
              Dropline OD
            </p>
          </div>

          {/* ── MAIN CARD ─────────────────────────────────────────────── */}
          <div className={styles.mainCard}>
            <div className={styles.cardLeft}>

              {/* Entity info row */}
              <div className={styles.entityRow}>
                <div className={styles.entityIcon}>🏦</div>
                <div className={styles.entityDetails}>
                  <div className={styles.entityGrid}>
                    <div>
                      <p className={styles.entityLabel}>Entity Name</p>
                      <p className={styles.entityValue}>
                        {customer.entityName || `Customer ${customer.customerId}`}
                      </p>
                    </div>
                    <div className={styles.entityRight}>
                      <p className={styles.entityLabel}>Account Number</p>
                      <p className={styles.entityValue}>
                        {customer.accountNumber || customer.cardNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── OD Limit setter ───────────────────────────────────── */}
              <div className={styles.limitBox}>
                <div className={styles.limitTop}>
                  <span className={styles.limitLabel}>Set Your OD Limit</span>
                  <div className={styles.limitDisplay}>
                    ₹ {formatINR(selectedAmount)}
                  </div>
                </div>
              </div>

              {/* Min / Max row */}
              <div className={styles.minMaxRow}>
                <div>
                  <p className={styles.minMaxLabel}>Min Eligible Amount</p>
                  <p className={styles.minMaxValue}>{formatINR(MIN_AMOUNT)}</p>
                </div>
                <div className={styles.minMaxRight}>
                  <p className={styles.minMaxLabel}>Max Eligible Amount</p>
                  <p className={styles.minMaxValue}>{formatINR(maxAmount)}</p>
                </div>
              </div>

              {/* ── SLIDER ────────────────────────────────────────────── */}
              <div className={styles.sliderWrap}>
                {/* Floating tooltip above thumb */}
                <div
                  className={styles.sliderTooltip}
                  style={{ left: `calc(${fillPct}% - ${fillPct * 0.28}px)` }}
                >
                  ₹{formatINR(selectedAmount)}
                </div>

                {/* Track with fill */}
                <div className={styles.sliderTrack}>
                  <div
                    className={styles.sliderFill}
                    style={{ width: `${fillPct}%` }}
                  ></div>
                </div>

                <input
                  type="range"
                  className={styles.sliderInput}
                  min={MIN_AMOUNT}
                  max={maxAmount}
                  step={STEP}
                  value={selectedAmount}
                  onChange={handleSlider}
                />
              </div>

            </div>{/* end cardLeft */}

            {/* ── RIGHT SIDE ────────────────────────────────────────── */}
            <div className={styles.cardRight}>

              {/* Hourglass / illustration card */}
              <div className={styles.illustrationCard}>
                <div className={styles.hourglassIllustration}>
                  ⏳
                </div>
                <div className={styles.tenureBlock}>
                  <p className={styles.tenureLabel}>Tenure</p>
                  <p className={styles.tenureValue}>{TENURE_MONTHS} Months</p>
                </div>
                <div className={styles.validityBlock}>
                  <p className={styles.tenureLabel}>Validity</p>
                  <p className={styles.tenureValue}>{VALIDITY}</p>
                </div>
              </div>

              {/* Rate of Interest */}
              <div className={styles.infoCard}>
                <div className={styles.infoIcon} style={{ background: '#E8F0FF' }}>
                  <span style={{ color: '#1565C0', fontWeight: 800, fontSize: 16 }}>%</span>
                </div>
                <div>
                  <p className={styles.infoLabel}>Rate of Interest</p>
                  <p className={styles.infoValue}>{INTEREST_RATE} %</p>
                </div>
              </div>

              {/* Processing Fee */}
              <div className={styles.infoCard}>
                <div className={styles.infoIcon} style={{ background: '#E8F5E9' }}>
                  <span style={{ fontSize: 18 }}>💰</span>
                </div>
                <div>
                  <p className={styles.infoLabel}>Processing Fees</p>
                  <p className={styles.infoValue}>{PROCESSING_FEE.toFixed(2)} %</p>
                </div>
              </div>

            </div>{/* end cardRight */}
          </div>{/* end mainCard */}

          {/* ── CONTINUE BUTTON ───────────────────────────────────────── */}
          <div className={styles.continueWrap}>
            <button className={styles.continueBtn} onClick={handleContinue}>
              Continue <span className={styles.continueArrow}>›</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}