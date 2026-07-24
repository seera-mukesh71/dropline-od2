'use client';

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import HeaderWithApp           from '../components/HeaderWithApp';
import styles                  from './dashboard.module.css';

const INTEREST_RATE_PA = 16.9;
const TENURE_MONTHS    = 36;
const PROCESSING_FEE   = 2.3;

function formatINR(n) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function formatINR2(n) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setDate(1);
  return d;
}
function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace(/ /g, '-');
}

export default function DashboardPage() {
  const router = useRouter();

  const [customer,     setCustomer]     = useState(null);
  const [appNumber,    setAppNumber]    = useState('');
  const [hoverAction,  setHoverAction]  = useState(null);
  const [showHistory,  setShowHistory]  = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  useEffect(() => {
    // Chatbot page signal
    window.__chatbotPage = 'dashboard';
    const send = () => {
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'pagechange', page: 'dashboard' }, '*');
      }
    };
    send();
    setTimeout(send, 1000);

    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    const c = JSON.parse(s);
    setCustomer(c);

    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);

    const seen = sessionStorage.getItem('hasSeenCongrats');
    if (!seen) setShowCongrats(true);
  }, [router]);

  async function handleDownloadSanction() {
    if (!customer) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId:  customer.customerId,
          docType:     'KFS',
          finalAmount: customer.finalAmount || customer.offerAmount,
          appNumber,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `SanctionLetter_${appNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (!customer) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const sanctioned     = Number(customer.finalAmount || customer.offerAmount || 0);
  const dailyRate      = INTEREST_RATE_PA / 100 / 365;
  const monthlyReduce  = sanctioned / TENURE_MONTHS;
  const utilizedAmt    = Math.round(sanctioned * 0.25 / 1000) * 1000;
  const availableAmt   = sanctioned - utilizedAmt;

  const activationDate   = new Date(2025, 4, 1);
  const facilityExpiry   = addMonths(activationDate, TENURE_MONTHS);
  const nextDroplineDate = addMonths(activationDate, 1);
  const nextInterestDate = addMonths(activationDate, 1);
  const daysElapsed      = 15;
  const daysLeft         = 12;

  const base       = new Date(2025, 4, 11);
  const withdrawal = Math.round(utilizedAmt * 0.4 / 1000) * 1000;
  const interestRows = [
    { date: new Date(base),                      activity: 'No Transaction',                    utilized: utilizedAmt },
    { date: new Date(base.getTime()+86400000),   activity: 'No Transaction',                    utilized: utilizedAmt },
    { date: new Date(base.getTime()+86400000*2), activity: `Withdrawal +₹${formatINR(withdrawal)}`, utilized: utilizedAmt + withdrawal },
    { date: new Date(base.getTime()+86400000*3), activity: 'No Transaction',                    utilized: utilizedAmt + withdrawal },
    { date: new Date(base.getTime()+86400000*4), activity: `Repayment -₹${formatINR(withdrawal)}`,  utilized: utilizedAmt },
  ];

  let runningAccrued = 0;
  const interestData = interestRows.map(row => {
    const dailyInt = row.utilized * dailyRate;
    runningAccrued += dailyInt;
    return { ...row, dailyInt, accrued: runningAccrued };
  });
  const totalAccrued = runningAccrued;

  const scheduleRows = [
    { label: 'At Sanction', date: fmtDate(activationDate),              limit: sanctioned },
    { label: 'Month 1',     date: fmtDate(addMonths(activationDate, 1)), limit: sanctioned - monthlyReduce },
    { label: 'Month 2',     date: fmtDate(addMonths(activationDate, 2)), limit: sanctioned - monthlyReduce * 2 },
    { label: 'Month 3',     date: fmtDate(addMonths(activationDate, 3)), limit: sanctioned - monthlyReduce * 3 },
    { label: '...',          date: '...',                                 limit: null },
    { label: `Month ${TENURE_MONTHS}`, date: fmtDate(addMonths(activationDate, TENURE_MONTHS)), limit: 0 },
  ];

  const ACTIONS = [
    { id: 'pay',   icon: '₹',  label: 'Pay & Make Utilization Zero',
      tip: 'Repay the entire outstanding utilized amount to bring your utilization to zero. No prepayment charges apply. Your OD limit remains active after repayment.' },
    { id: 'auto',  icon: '📅', label: 'Auto Debit (Concept)',
      tip: 'Set up automatic monthly interest debits from your linked current account on the Next Interest Debit Date. Avoids penalty for missed payments.' },
    { id: 'close', icon: '✕',  label: 'Close the Dropline OD',
      tip: 'Permanently close your Dropline OD facility. Ensure outstanding balance is zero before closing. An NOC will be issued after successful closure.' },
  ];

  return (
    <div className={styles.pageWrapper}>

      <HeaderWithApp appNumber={appNumber} />

      <div className={styles.titleBar}>
        <h1 className={styles.dashTitle}>Dropline OD Dashboard</h1>
        <button
          className={styles.downloadSanctionBtn}
          onClick={handleDownloadSanction}
          disabled={downloading}
        >
          {downloading ? 'Downloading…' : '↓ Download Sanction Letter'}
        </button>
      </div>

      <div className={styles.pageBody}>

        {/* ── 6 STAT CARDS ─────────────────────────────────────────── */}
        <div className={styles.statsRow}>
          {[
            { icon: '🏦', label: 'Sanctioned Limit',   value: `₹${formatINR(sanctioned)}`,    sub: 'Total Approved Limit',      color: '#E84E20' },
            { icon: '💳', label: 'Available Limit',     value: `₹${formatINR(availableAmt)}`,  sub: 'Currently Available',        color: '#2E7D32' },
            { icon: '📊', label: 'Utilized Amount',     value: `₹${formatINR(utilizedAmt)}`,   sub: 'Total Utilized',             color: '#1565C0' },
            { icon: '%',  label: 'Accrued Interest',    value: `₹${formatINR2(totalAccrued)}`, sub: 'Interest Accrued till date', color: '#E84E20' },
            { icon: '%',  label: 'Interest Rate (p.a.)', value: `${INTEREST_RATE_PA}%`,         sub: 'Fixed Rate',                 color: '#6A1B9A' },
            { icon: '📄', label: 'Processing Fee',      value: `${PROCESSING_FEE}%`,           sub: 'One-time',                   color: '#E84E20' },
          ].map(card => (
            <div key={card.label} className={styles.statCard}>
              <div className={styles.statIconWrap}>{card.icon}</div>
              <div>
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue} style={{ color: card.color }}>{card.value}</p>
                <p className={styles.statSub}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 3 COLUMN MAIN ────────────────────────────────────────── */}
        <div className={styles.mainGrid}>

          {/* COL 1: Dropline Schedule */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle} style={{ color: '#E84E20' }}>
              📅 Dropline Schedule (Reducing Limit)
            </h2>
            <p className={styles.panelSub}>
              Your credit limit reduces automatically as per the dropline schedule.
            </p>
            <div className={styles.scheduleInfo}>
              {[
                ['Sanctioned Limit',   `₹${formatINR(sanctioned)}`],
                ['Dropline Period',    `${TENURE_MONTHS} Months`],
                ['Dropline Reduction', `₹${formatINR2(monthlyReduce)} per month`],
                ['Next Dropline Date', fmtDate(nextDroplineDate)],
              ].map(([k, v]) => (
                <div key={k} className={styles.infoRow}>
                  <span className={styles.infoKey}>{k}</span>
                  <span className={styles.infoVal}>
                    {k === 'Next Dropline Date'
                      ? <><span className={styles.dateOrange}>{v}</span><span className={styles.daysLeft}> ({daysLeft} days left)</span></>
                      : v}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.scheduleTable}>
              <div className={styles.scheduleHeader}>
                <span>Month</span><span>Dropline Date</span>
                <span style={{ textAlign:'right' }}>Max Available Limit</span>
              </div>
              {scheduleRows.map((row, i) => (
                <div key={i} className={`${styles.scheduleRow} ${i%2===0?styles.scheduleRowAlt:''}`}>
                  <span className={styles.scheduleMonth}>{row.label}</span>
                  <span>{row.date}</span>
                  <span style={{ textAlign:'right', fontWeight:600 }}>
                    {row.limit === null ? '...' : `₹${formatINR2(row.limit)}`}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.noteBox}>
              <span className={styles.noteIcon}>ⓘ</span>
              <span>Your available limit will never exceed the Maximum Available Limit applicable for the current period.</span>
            </div>
          </div>

          {/* COL 2: Interest Calculation */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle} style={{ color: '#E84E20' }}>
              Interest Calculation (Last 5 Days)
            </h2>
            <div className={styles.interestInfoBox}>
              <span className={styles.noteIcon}>₹</span>
              <span>Interest is charged only on the utilized amount for the number of days it is utilized.</span>
            </div>
            <div className={styles.interestTable}>
              <div className={styles.interestHeader}>
                <span>Date</span><span>Activity</span>
                <span style={{ textAlign:'right' }}>Utilized (EOD)</span>
                <span style={{ textAlign:'right' }}>Daily Interest*</span>
                <span style={{ textAlign:'right' }}>Accrued</span>
              </div>
              {interestData.map((row, i) => {
                const isW = row.activity.includes('Withdrawal');
                const isR = row.activity.includes('Repayment');
                return (
                  <div key={i} className={`${styles.interestRow} ${i%2===0?styles.interestRowAlt:''}`}>
                    <span>{fmtDate(row.date)}</span>
                    <span style={{ color: isW?'#C62828':isR?'#2E7D32':'#555', fontSize:11 }}>{row.activity}</span>
                    <span style={{ textAlign:'right' }}>₹{formatINR(Math.round(row.utilized))}</span>
                    <span style={{ textAlign:'right' }}>₹{formatINR2(row.dailyInt)}</span>
                    <span style={{ textAlign:'right', fontWeight:600 }}>₹{formatINR2(row.accrued)}</span>
                  </div>
                );
              })}
              <div className={styles.interestTotalRow}>
                <span style={{ gridColumn:'1/5', fontWeight:700 }}>Total Accrued Interest</span>
                <span style={{ textAlign:'right', fontWeight:800, color:'#E84E20' }}>₹{formatINR2(totalAccrued)}</span>
              </div>
            </div>
            <div className={styles.dailyRateBox}>
              Current Daily Interest Rate*: {(dailyRate*100).toFixed(6)}% ({INTEREST_RATE_PA}% p.a.)
            </div>
            <div
              className={styles.historyBtn}
              onMouseEnter={() => setShowHistory(true)}
              onMouseLeave={() => setShowHistory(false)}
            >
              <span>🕐 View Full Utilization History</span>
              <span className={styles.historyArrow}>›</span>
              {showHistory && (
                <div className={styles.historyTooltip}>
                  View your complete transaction history including all withdrawals, repayments, and daily interest accruals since facility activation. Available for the full {TENURE_MONTHS}-month tenure.
                </div>
              )}
            </div>
          </div>

          {/* COL 3: Key Details */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle} style={{ color: '#1a3a5c' }}>Key Details</h2>
            <div className={styles.keyDetailsList}>
              {[
                { icon:'📅', label:'Facility Validity',        value: fmtDate(facilityExpiry) },
                { icon:'📋', label:'Tenure',                   value: `${TENURE_MONTHS} Months (Reducing Dropline)` },
                { icon:'🔢', label:'Account Number',           value: customer.accountNumber || customer.cardNumber || 'N/A' },
                { icon:'⏱',  label:'Days Elapsed',            value: `${daysElapsed} Days` },
                { icon:'📆', label:'Next Interest Debit Date', value: fmtDate(nextInterestDate) },
                { icon:'📅', label:'Next Dropline Date',
                  value: <><span className={styles.dateOrange}>{fmtDate(nextDroplineDate)}</span><span className={styles.daysLeft}> ({daysLeft} days left)</span></> },
              ].map((item, i) => (
                <div key={i} className={styles.keyDetailRow}>
                  <div className={styles.keyDetailLeft}>
                    <span className={styles.keyDetailIcon}>{item.icon}</span>
                    <span className={styles.keyDetailLabel}>{item.label}</span>
                  </div>
                  <span className={styles.keyDetailValue}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.noteBox} style={{ marginTop:16 }}>
              <span className={styles.noteIcon}>🔒</span>
              <span>On every Next Dropline Date, your Maximum Available Limit will be reduced as per the schedule.</span>
            </div>
          </div>

        </div>

        {/* ── 3 ACTION BUTTONS ─────────────────────────────────────── */}
        <div className={styles.actionsRow}>
          {ACTIONS.map(action => (
            <div key={action.id} className={styles.actionCard}
              onMouseEnter={() => setHoverAction(action.id)}
              onMouseLeave={() => setHoverAction(null)}
            >
              {hoverAction === action.id && (
                <div className={styles.actionTooltip}>{action.tip}</div>
              )}
              <div className={styles.actionInner}>
                <div className={styles.actionIconWrap}>{action.icon}</div>
                <span className={styles.actionLabel}>{action.label}</span>
                <span className={styles.actionArrow}>›</span>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.footerNote}>
          * Interest is calculated daily on utilized amount. Please ensure sufficient balance on Next Interest Debit Date to avoid penalty.<br />
          Limits are subject to change as per your account conduct and bank policy.
        </p>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONGRATULATIONS OVERLAY — ICICI themed, professional
      ══════════════════════════════════════════════════════════════ */}
      {showCongrats && customer && (
        <div className={styles.congratsOverlay}>
          <div className={styles.congratsCard}>

            {/* Red header band */}
            <div className={styles.congratsHeader}>
              <div className={styles.congratsHeaderLogo}>
                <img src="/icici-logo.png" alt="ICICI Bank" style={{ height:28, width:'auto', objectFit:'contain', filter:'brightness(0) invert(1)' }} />
              </div>
              <div className={styles.congratsHeaderCheck}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>

            {/* Body */}
            <div className={styles.congratsBody}>
              <h2 className={styles.congratsTitle}>Congratulations!</h2>
              <p className={styles.congratsSub}>
                Your Dropline OD facility has been successfully activated.
              </p>

              {/* Amount box */}
              <div className={styles.congratsAmountBox}>
                <p className={styles.congratsAmountLabel}>Sanctioned OD Limit</p>
                <p className={styles.congratsAmount}>
                  ₹ {Number(customer.finalAmount || customer.offerAmount || 0).toLocaleString('en-IN')}
                </p>
                <div className={styles.congratsAmountTags}>
                  <span className={styles.congratsTag}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {INTEREST_RATE_PA}% p.a.
                  </span>
                  <span className={styles.congratsTag}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {TENURE_MONTHS} Months
                  </span>
                  <span className={styles.congratsTag}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Unsecured
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className={styles.congratsInfoGrid}>
                <div className={styles.congratsInfoItem}>
                  <p className={styles.congratsInfoLabel}>Account Number</p>
                  <p className={styles.congratsInfoValue}>{customer.accountNumber || customer.cardNumber || 'N/A'}</p>
                </div>
                <div className={styles.congratsInfoItem}>
                  <p className={styles.congratsInfoLabel}>Status</p>
                  <p className={styles.congratsInfoValue} style={{ color:'#2E7D32' }}>● Active</p>
                </div>
                <div className={styles.congratsInfoItem}>
                  <p className={styles.congratsInfoLabel}>Processing Fee</p>
                  <p className={styles.congratsInfoValue}>{PROCESSING_FEE}% (One-time)</p>
                </div>
                <div className={styles.congratsInfoItem}>
                  <p className={styles.congratsInfoLabel}>Interest Charged On</p>
                  <p className={styles.congratsInfoValue}>Utilized Amount Only</p>
                </div>
              </div>

              <button
                className={styles.congratsBtn}
                onClick={() => {
                  sessionStorage.setItem('hasSeenCongrats', 'true');
                  setShowCongrats(false);
                }}
              >
                Go to My Dashboard →
              </button>

              <p className={styles.congratsNote}>
                Download your Sanction Letter from the dashboard anytime.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}