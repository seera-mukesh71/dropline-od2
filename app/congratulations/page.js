'use client';
import HeaderWithApp from '../components/HeaderWithApp';


import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import styles                  from './congratulations.module.css';

// Convert number to Indian words (simplified for common lakh/crore values)
function amountInWords(num) {
  const n = Number(num);
  if (!n) return '';
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `Rupees ${cr % 1 === 0 ? cr : cr.toFixed(1)} Crore Only`;
  }
  if (n >= 100000) {
    const lk = n / 100000;
    return `Rupees ${lk % 1 === 0 ? lk : lk.toFixed(1)} Lakh${lk > 1 ? 's' : ''} Only`;
  }
  return `Rupees ${n.toLocaleString('en-IN')} Only`;
}

export default function CongratulationsPage() {
  const router = useRouter();

  const [customer,  setCustomer]  = useState(null);
  const [appNumber, setAppNumber] = useState('');
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    window.__chatbotPage = 'congrats';
    window.dispatchEvent(new CustomEvent('chatbot:pagechange', { detail: { page: 'congrats' } }));
  }, []);

  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    setCustomer(JSON.parse(s));
    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);
  }, [router]);

  function handleCopy() {
    navigator.clipboard.writeText(appNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!customer) return null;

  // Use the amount the customer selected on the offer-details slider
  const sanctionedAmount = customer.finalAmount || customer.offerAmount || 0;

  return (
    <>
    <div className={styles.pageWrapper}>

      {/* ── WHITE HEADER ─────────────────────────────────────────────── */}
      <HeaderWithApp appNumber={appNumber} />

      {/* ── RED HERO SECTION ──────────────────────────────────────────── */}
      <section className={styles.hero}>

        {/* Decorative diamond confetti */}
        <div className={styles.confetti} aria-hidden="true">
          {[
            { top:'12%', left:'6%',  size:14, opacity:0.7 },
            { top:'28%', left:'3%',  size:10, opacity:0.5 },
            { top:'55%', left:'8%',  size:16, opacity:0.6 },
            { top:'70%', left:'4%',  size:10, opacity:0.4 },
            { top:'18%', left:'18%', size:12, opacity:0.5 },
            { top:'42%', left:'14%', size:8,  opacity:0.6 },
            { top:'80%', left:'20%', size:14, opacity:0.5 },
            { top:'10%', right:'5%', size:14, opacity:0.7 },
            { top:'30%', right:'3%', size:10, opacity:0.5 },
            { top:'52%', right:'7%', size:16, opacity:0.6 },
            { top:'72%', right:'4%', size:10, opacity:0.4 },
            { top:'20%', right:'17%',size:12, opacity:0.5 },
            { top:'45%', right:'13%',size:8,  opacity:0.6 },
            { top:'78%', right:'19%',size:14, opacity:0.5 },
          ].map((d, i) => (
            <div
              key={i}
              className={styles.diamond}
              style={{
                top:     d.top,
                left:    d.left,
                right:   d.right,
                width:   d.size,
                height:  d.size,
                opacity: d.opacity,
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>

        {/* Checkmark circle */}
        <div className={styles.checkCircle}>
          <span className={styles.checkMark}>✓</span>
        </div>

        <h1 className={styles.heroTitle}>Congratulations!</h1>
        <p className={styles.heroSub}>Your Dropline OD Offer Has Been Sanctioned</p>

        {/* Decorative divider line with dot */}
        <div className={styles.heroDivider}>
          <div className={styles.heroDividerLine}></div>
          <div className={styles.heroDividerDot}></div>
          <div className={styles.heroDividerLine}></div>
        </div>

        <p className={styles.heroBody}>
          Your Unsecured Dropline OD facility is now active.<br />
          You can start using your sanctioned limit immediately.
        </p>

      </section>

      {/* ── WHITE FACILITY DETAILS CARD ───────────────────────────────── */}
      <div className={styles.cardWrap}>
        <div className={styles.facilityCard}>

          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitleLine}></div>
            <h2 className={styles.cardTitle}>Your Sanctioned Facility Details</h2>
            <div className={styles.cardTitleLine}></div>
          </div>

          <div className={styles.detailsGrid}>

            {/* Sanctioned Limit */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>🏦</div>
              <p className={styles.detailLabel}>Sanctioned Limit</p>
              <p className={styles.detailValue}>
                ₹{Number(sanctionedAmount).toLocaleString('en-IN')}
              </p>
              <p className={styles.detailSub}>{amountInWords(sanctionedAmount)}</p>
            </div>

            {/* Tenure */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>📅</div>
              <p className={styles.detailLabel}>Tenure</p>
              <p className={styles.detailValue}>36 Months</p>
              <p className={styles.detailSub}>Upto 36 Months</p>
            </div>

            {/* Interest Rate */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>%</div>
              <p className={styles.detailLabel}>Interest Rate</p>
              <p className={styles.detailValue}>16.9 p.a.</p>
              <p className={styles.detailSub}>Per Annum (Floating)</p>
            </div>

            {/* Repayment Structure */}
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>📊</div>
              <p className={styles.detailLabel}>Repayment Structure</p>
              <p className={`${styles.detailValue} ${styles.detailValueOrange}`}>
                Reducing Dropline
              </p>
              <p className={styles.detailSub}>Limit reduces as per repayment schedule</p>
            </div>

          </div>
        </div>

        {/* ── Info strip ──────────────────────────────────────────────── */}
        <div className={styles.infoStrip}>
          <div className={styles.infoStripItem}>
            <div className={styles.infoStripIcon}>🛡</div>
            <span className={styles.infoStripText}>Facility activated successfully</span>
          </div>
          <div className={styles.infoStripDivider}></div>
          <div className={styles.infoStripItem}>
            <div className={styles.infoStripIcon}>₹</div>
            <span className={styles.infoStripText}>
              Interest will be charged only on the utilized amount
            </span>
          </div>
        </div>

        {/* ── Go to Dashboard button ───────────────────────────────────── */}
        <button
          className={styles.dashboardBtn}
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard &nbsp;→
        </button>

      </div>

    </div>
    </>
  );
}