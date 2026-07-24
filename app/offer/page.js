'use client';

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import HeaderWithApp           from '../components/HeaderWithApp';
import styles                  from './offer.module.css';

const INTEREST_RATE  = 16.9;
const TENURE_MONTHS  = 36;
const PROCESSING_FEE = 2.3;
const MIN_AMOUNT     = 50000;
const STEP           = 1000;

function formatINR(n) {
  return Number(n || 0).toLocaleString('en-IN');
}
function formatINR2(n) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OfferPage() {
  const router = useRouter();

  const [customer,  setCustomer]  = useState(null);
  const [appNumber, setAppNumber] = useState('');
  const [inputVal,  setInputVal]  = useState('');
  const [selectedAmt, setSelectedAmt] = useState(0);
  useEffect(() => {
    window.__chatbotPage = 'login';
    window.dispatchEvent(new CustomEvent('chatbot:pagechange', { detail: { page: 'offer' } }));
  }, []);
  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    const c = JSON.parse(s);
    setCustomer(c);
    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);
    const maxAmt = Number(c.offerAmount) || 0;
    setSelectedAmt(maxAmt);
    setInputVal(formatINR(maxAmt));
  }, [router]);

  if (!customer) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const maxAmount    = Number(customer.offerAmount) || 0;
  const sliderPct    = maxAmount > MIN_AMOUNT
    ? ((selectedAmt - MIN_AMOUNT) / (maxAmount - MIN_AMOUNT)) * 100
    : 0;
  const chosenDropline = selectedAmt > 0 ? selectedAmt / TENURE_MONTHS : 0;

  function handleInputChange(e) {
    const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
    setInputVal(raw ? formatINR(raw) : '');
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      setSelectedAmt(Math.max(MIN_AMOUNT, Math.min(num, maxAmount)));
    }
  }

  function handleInputBlur() {
    const rounded = Math.round(selectedAmt / STEP) * STEP;
    setSelectedAmt(rounded);
    setInputVal(formatINR(rounded));
  }

  function handleSlider(e) {
    const rounded = Math.round(parseInt(e.target.value, 10) / STEP) * STEP;
    setSelectedAmt(rounded);
    setInputVal(formatINR(rounded));
  }

  function handleContinue() {
    if (selectedAmt < MIN_AMOUNT) { alert(`Minimum amount is Rs.${formatINR(MIN_AMOUNT)}`); return; }
    const stored = JSON.parse(sessionStorage.getItem('odCustomer') || '{}');
    stored.finalAmount = selectedAmt;
    sessionStorage.setItem('odCustomer', JSON.stringify(stored));
    router.push('/apply');
  }

  return (
    <div className={styles.pageWrapper}>

      <HeaderWithApp appNumber={appNumber} />

      <div className={styles.bg}>
        <div className={styles.pageInner}>

          {/* Green congratulations banner */}
          <div className={styles.congoBanner}>
            <div className={styles.congoCheck}>✓</div>
            <p className={styles.congoText}>
              Congratulations! You are eligible for{' '}
              <strong className={styles.congoAmount}>₹ {formatINR(maxAmount)}</strong>{' '}
              Dropline OD
            </p>
          </div>

          {/* Main white card */}
          <div className={styles.mainCard}>

            {/* Top grid */}
            <div className={styles.topGrid}>

              {/* LEFT */}
              <div className={styles.offerLeft}>
                <h2 className={styles.offerTitle}>Review Your Pre-approved Offer</h2>
                <p className={styles.offerSub}>Please review your offer details carefully.</p>

                <div className={styles.offerAmtCard}>
                  <div className={styles.offerShieldIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <div className={styles.offerAmtMain}>
                    <p className={styles.offerAmtLabel}>Pre-approved up to</p>
                    <p className={styles.offerAmtValue}>₹{formatINR(maxAmount)}</p>
                    <p className={styles.offerValidNote}>Offer valid for 365 Days</p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className={styles.amountRight}>
                <p className={styles.amountQuestion}>How much would you like to avail?</p>
                <p className={styles.amountHint}>
                  Enter the amount you wish to avail (up to your offered limit)
                </p>

                <div className={styles.amountInputWrap}>
                  <span className={styles.rupeeSymbol}>₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.amountInput}
                    value={inputVal}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={formatINR(maxAmount)}
                  />
                </div>

                <div className={styles.sliderWrap}>
                  <div className={styles.sliderTrack}>
                    <div className={styles.sliderFill} style={{ width: `${sliderPct}%` }}></div>
                  </div>
                  <input
                    type="range"
                    className={styles.sliderInput}
                    min={MIN_AMOUNT}
                    max={maxAmount}
                    step={STEP}
                    value={selectedAmt}
                    onChange={handleSlider}
                  />
                </div>

                <div className={styles.sliderLabels}>
                  <span>Minimum ₹{formatINR(MIN_AMOUNT)}</span>
                  <span>Available up to ₹{formatINR(maxAmount)}</span>
                </div>

                <div className={styles.droplineInfoBox}>
                  <span className={styles.infoBoxIcon}>ⓘ</span>
                  <span>
                    You will be eligible for a dropline reduction of{' '}
                    <strong className={styles.infoBoxAmt}>
                      ₹{formatINR2(chosenDropline)}
                    </strong>{' '}
                    per month based on the amount you avail.
                  </span>
                </div>
              </div>

            </div>

            {/* Entity + Account row */}
            <div className={styles.entityRow}>
              <div className={styles.entityItem}>
                <div className={styles.entityIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="22" x2="21" y2="22" />
                    <line x1="6" y1="18" x2="6" y2="11" />
                    <line x1="10" y1="18" x2="10" y2="11" />
                    <line x1="14" y1="18" x2="14" y2="11" />
                    <line x1="18" y1="18" x2="18" y2="11" />
                    <polygon points="12 2 20 7 4 7" />
                  </svg>
                </div>
                <div>
                  <p className={styles.entityLabel}>Entity Name</p>
                  <p className={styles.entityValue}>{customer.entityName || customer.userId}</p>
                </div>
              </div>
              <div className={styles.entityDivider}></div>
              <div className={styles.entityItem}>
                <div className={styles.entityIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className={styles.entityLabel}>Account Number</p>
                  <p className={styles.entityValue}>{customer.accountNumber || customer.cardNumber}</p>
                </div>
              </div>
            </div>

            {/* 4 Bottom stat cards — no extra height, fit content */}
            <div className={styles.statsGrid}>

              <div className={styles.statCard}>
                <div className={styles.statCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className={styles.statLabel}>Processing Fee</p>
                  <p className={styles.statValue}>{PROCESSING_FEE}%</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className={styles.statLabel}>Tenure</p>
                  <p className={styles.statValue}>{TENURE_MONTHS} Months</p>
                  <p className={styles.statNote}>(Reducing Dropline)</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className={styles.statLabel}>Renewal</p>
                  <p className={styles.statValue}>Every 12 Months</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <p className={styles.statLabel}>Interest Rate (p.a.)</p>
                  <p className={styles.statValue}>{INTEREST_RATE}%</p>
                </div>
              </div>

            </div>

            {/* Back + Continue */}
            <div className={styles.actionRow}>
              <button className={styles.backBtn} onClick={() => router.push('/login')}>
                ← Back
              </button>
              <button className={styles.continueBtn} onClick={handleContinue}>
                Continue →
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}