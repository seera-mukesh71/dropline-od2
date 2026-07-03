'use client';

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import HeaderWithApp           from '../components/HeaderWithApp';
import styles                  from './dashboard.module.css';

// ── Constants ─────────────────────────────────────────────────────────────
const INTEREST_RATE_PA = 16.9;
const TENURE_MONTHS    = 36;
const PROCESSING_FEE   = 2.3;

function formatINR(n) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}
function formatINR2(n) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setDate(1);
  return d;
}
function fmtDate(date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
}
function daysBetween(a, b) {
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const router = useRouter();

  const [customer,   setCustomer]   = useState(null);
  const [appNumber,  setAppNumber]  = useState('');
  const [hoverAction, setHoverAction] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    setCustomer(JSON.parse(s));
    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);
  }, [router]);

  if (!customer) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // ── Core values ──────────────────────────────────────────────────────────
  const sanctioned     = Number(customer.finalAmount || customer.offerAmount || 0);
  const dailyRate      = INTEREST_RATE_PA / 100 / 365;
  const monthlyReduce  = sanctioned / TENURE_MONTHS;

  // Simulate: 25% utilized
  const utilizedAmt    = Math.round(sanctioned * 0.25 / 1000) * 1000;
  const availableAmt   = sanctioned - utilizedAmt;

  // Activation date = today (simulation)
  const activationDate = new Date(2025, 4, 1); // 01-May-2025 for demo
  const facilityExpiry = addMonths(activationDate, TENURE_MONTHS);
  const daysElapsed    = 15;
  const nextDroplineDate = addMonths(activationDate, 1);
  const nextInterestDate = addMonths(activationDate, 1);

  // Days left to next dropline
  const today = new Date(2025, 4, 20); // demo "today"
  const daysLeft = daysBetween(today, nextDroplineDate);

  // ── Interest calculation — last 5 days ───────────────────────────────────
  const base = new Date(2025, 4, 11); // 11-May-2025
  const interestRows = [
    { date: new Date(base),                          activity: 'No Transaction',       utilized: utilizedAmt },
    { date: new Date(base.getTime()+86400000),       activity: 'No Transaction',       utilized: utilizedAmt },
    { date: new Date(base.getTime()+86400000*2),     activity: `Withdrawal +₹${formatINR(Math.round(utilizedAmt*0.4/1000)*1000)}`, utilized: utilizedAmt + Math.round(utilizedAmt*0.4/1000)*1000 },
    { date: new Date(base.getTime()+86400000*3),     activity: 'No Transaction',       utilized: utilizedAmt + Math.round(utilizedAmt*0.4/1000)*1000 },
    { date: new Date(base.getTime()+86400000*4),     activity: `Repayment -₹${formatINR(Math.round(utilizedAmt*0.4/1000)*1000)}`,  utilized: utilizedAmt },
  ];

  let runningAccrued = 0;
  const interestData = interestRows.map(row => {
    const dailyInt = row.utilized * dailyRate;
    runningAccrued += dailyInt;
    return { ...row, dailyInt, accrued: runningAccrued };
  });
  const totalAccrued = runningAccrued;

  // ── Dropline schedule ─────────────────────────────────────────────────────
  const scheduleRows = [];
  scheduleRows.push({ label: 'At Sanction', date: fmtDate(activationDate), limit: sanctioned });
  for (let m = 1; m <= Math.min(3, TENURE_MONTHS); m++) {
    scheduleRows.push({
      label: `Month ${m}`,
      date:  fmtDate(addMonths(activationDate, m)),
      limit: sanctioned - monthlyReduce * m,
    });
  }
  scheduleRows.push({ label: '...', date: '...', limit: null });
  scheduleRows.push({ label: `Month ${TENURE_MONTHS}`, date: fmtDate(addMonths(activationDate, TENURE_MONTHS)), limit: 0 });

  // ── Actions ───────────────────────────────────────────────────────────────
  const ACTIONS = [
    {
      id:   'pay',
      icon: '₹',
      label: 'Pay & Make Utilization Zero',
      tip:  'Repay the entire outstanding utilized amount to bring your utilization to zero. No prepayment charges apply. Your OD limit remains active after repayment.',
    },
    {
      id:   'auto',
      icon: '📅',
      label: 'Auto Debit (Concept)',
      tip:  'Set up automatic monthly interest debits from your linked current account on the Next Interest Debit Date. Avoids penalty for missed payments.',
    },
    {
      id:   'close',
      icon: '✕',
      label: 'Close the Dropline OD',
      tip:  'Permanently close your Dropline OD facility. Ensure outstanding balance is zero before closing. An NOC will be issued after successful closure.',
    },
  ];

  return (
    <div className={styles.pageWrapper}>

      {/* ── SHARED HEADER ────────────────────────────────────────────── */}
      <HeaderWithApp appNumber={appNumber} />

      {/* ── DASHBOARD TITLE BAR ──────────────────────────────────────── */}
      <div className={styles.titleBar}>
        <h1 className={styles.dashTitle}>Dropline OD Dashboard</h1>
        <div className={styles.titleActions}>
          <button className={styles.downloadBtn} onClick={() => alert('Sanction letter download coming soon.')}>
            ↓ Download Sanction Letter
          </button>
          <button className={styles.bellBtn} title="Notifications">🔔</button>
        </div>
      </div>

      <div className={styles.pageBody}>

        {/* ── 6 STAT CARDS ─────────────────────────────────────────── */}
        <div className={styles.statsRow}>
          {[
            { icon: '🏦', label: 'Sanctioned Limit',  value: `₹${formatINR(sanctioned)}`,   sub: 'Total Approved Limit',   color: '#E84E20' },
            { icon: '💳', label: 'Available Limit',   value: `₹${formatINR(availableAmt)}`,  sub: 'Currently Available',    color: '#2E7D32' },
            { icon: '📊', label: 'Utilized Amount',   value: `₹${formatINR(utilizedAmt)}`,   sub: 'Total Utilized',         color: '#1565C0' },
            { icon: '%',  label: 'Accrued Interest',  value: `₹${formatINR2(totalAccrued)}`, sub: 'Interest Accrued till date', color: '#E84E20' },
            { icon: '%',  label: 'Interest Rate (p.a.)', value: `${INTEREST_RATE_PA}%`,       sub: 'Fixed Rate',             color: '#6A1B9A' },
            { icon: '📄', label: 'Processing Fee',    value: `${PROCESSING_FEE}%`,            sub: 'One-time',               color: '#E84E20' },
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

        {/* ── THREE COLUMN MAIN SECTION ─────────────────────────────── */}
        <div className={styles.mainGrid}>

          {/* ── COL 1: DROPLINE SCHEDULE ─────────────────────────────── */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle} style={{ color: '#E84E20' }}>
              📅 Dropline Schedule (Reducing Limit)
            </h2>
            <p className={styles.panelSub}>
              Your credit limit reduces automatically as per the dropline schedule.
            </p>

            <div className={styles.scheduleInfo}>
              {[
                ['Sanctioned Limit',    `₹${formatINR(sanctioned)}`],
                ['Dropline Period',     `${TENURE_MONTHS} Months`],
                ['Dropline Reduction',  `₹${formatINR2(monthlyReduce)} per month`],
                ['Next Dropline Date',  fmtDate(nextDroplineDate)],
              ].map(([k, v]) => (
                <div key={k} className={styles.infoRow}>
                  <span className={styles.infoKey}>{k}</span>
                  <span className={styles.infoVal}>
                    {k === 'Next Dropline Date'
                      ? <><span className={styles.dateOrange}>{v}</span><span className={styles.daysLeft}> ({daysLeft} days left)</span></>
                      : v
                    }
                  </span>
                </div>
              ))}
            </div>

            {/* Schedule table */}
            <div className={styles.scheduleTable}>
              <div className={styles.scheduleHeader}>
                <span>Month</span>
                <span>Dropline Date</span>
                <span style={{ textAlign:'right' }}>Max Available Limit</span>
              </div>
              {scheduleRows.map((row, i) => (
                <div key={i} className={`${styles.scheduleRow} ${i % 2 === 0 ? styles.scheduleRowAlt : ''}`}>
                  <span className={styles.scheduleMonth}>{row.label}</span>
                  <span>{row.date}</span>
                  <span style={{ textAlign:'right', fontWeight: 600 }}>
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

          {/* ── COL 2: INTEREST CALCULATION ──────────────────────────── */}
          <div className={styles.panel}>
            <div className={styles.panelTitleRow}>
              <h2 className={styles.panelTitle} style={{ color: '#E84E20' }}>
                Interest Calculation (Last 5 Days)
              </h2>
            </div>

            <div className={styles.interestInfoBox}>
              <span className={styles.noteIcon}>₹</span>
              <span>Interest is charged only on the utilized amount for the number of days it is utilized.</span>
            </div>

            {/* Interest table */}
            <div className={styles.interestTable}>
              <div className={styles.interestHeader}>
                <span>Date</span>
                <span>Activity</span>
                <span style={{ textAlign:'right' }}>Utilized Amount (EOD)</span>
                <span style={{ textAlign:'right' }}>Daily Interest*</span>
                <span style={{ textAlign:'right' }}>Accrued Interest</span>
              </div>
              {interestData.map((row, i) => {
                const isWithdrawal = row.activity.includes('Withdrawal');
                const isRepayment  = row.activity.includes('Repayment');
                return (
                  <div key={i} className={`${styles.interestRow} ${i % 2 === 0 ? styles.interestRowAlt : ''}`}>
                    <span>{fmtDate(row.date)}</span>
                    <span style={{ color: isWithdrawal ? '#C62828' : isRepayment ? '#2E7D32' : '#555' }}>
                      {row.activity}
                    </span>
                    <span style={{ textAlign:'right' }}>₹{formatINR(Math.round(row.utilized))}</span>
                    <span style={{ textAlign:'right' }}>₹{formatINR2(row.dailyInt)}</span>
                    <span style={{ textAlign:'right', fontWeight:600 }}>₹{formatINR2(row.accrued)}</span>
                  </div>
                );
              })}
              <div className={styles.interestTotalRow}>
                <span style={{ gridColumn: '1/5', fontWeight:700 }}>Total Accrued Interest</span>
                <span style={{ textAlign:'right', fontWeight:800, color:'#E84E20' }}>₹{formatINR2(totalAccrued)}</span>
              </div>
            </div>

            <div className={styles.dailyRateBox}>
              Current Daily Interest Rate*: {(dailyRate * 100).toFixed(6)}% ({INTEREST_RATE_PA}% p.a.)
            </div>

            {/* View Full Utilization History — hover tooltip */}
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

          {/* ── COL 3: KEY DETAILS ───────────────────────────────────── */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle} style={{ color: '#1a3a5c' }}>Key Details</h2>

            <div className={styles.keyDetailsList}>
              {[
                { icon: '📅', label: 'Facility Validity',      value: fmtDate(facilityExpiry) },
                { icon: '📋', label: 'Tenure',                 value: `${TENURE_MONTHS} Months (Reducing Dropline)` },
                { icon: '🔢', label: 'Account Number',         value: customer.accountNumber || customer.cardNumber || 'N/A' },
                { icon: '⏱',  label: 'Days Elapsed',          value: `${daysElapsed} Days` },
                { icon: '📆', label: 'Next Interest Debit Date', value: fmtDate(nextInterestDate) },
                { icon: '📅', label: 'Next Dropline Date',     value: <><span className={styles.dateOrange}>{fmtDate(nextDroplineDate)}</span><span className={styles.daysLeft}> ({daysLeft} days left)</span></> },
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

            <div className={styles.noteBox} style={{ marginTop: 16 }}>
              <span className={styles.noteIcon}>🔒</span>
              <span>On every Next Dropline Date, your Maximum Available Limit will be reduced as per the schedule.</span>
            </div>
          </div>

        </div>{/* end mainGrid */}

        {/* ── 3 ACTION BUTTONS WITH HOVER TOOLTIPS ─────────────────── */}
        <div className={styles.actionsRow}>
          {ACTIONS.map(action => (
            <div
              key={action.id}
              className={styles.actionCard}
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

        {/* ── FOOTER NOTE ──────────────────────────────────────────── */}
        <p className={styles.footerNote}>
          * Interest is calculated daily on utilized amount. Please ensure sufficient balance on Next Interest Debit Date to avoid penalty.
          <br />Limits are subject to change as per your account conduct and bank policy.
        </p>

      </div>
    </div>
  );
}