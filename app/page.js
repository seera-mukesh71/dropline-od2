'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

  function handleAccountType(type) {
    if (type === 'current') {
      router.push('/login');
    } else {
      // Savings account — not eligible, but routing to login still
      // Later you can show an "ineligible" page
      router.push('/login?type=savings');
    }
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── TOP HEADER BAR ─────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoGroup}>
            <div className={styles.logoICICI}>
              <span className={styles.logoCircle}>i</span>
              <span className={styles.logoBank}>ICICI Bank</span>
            </div>
            <div className={styles.dividerLine}></div>
            <div className={styles.logoDropline}>
              <span className={styles.droplineText}>Dropline</span>
              <span className={styles.odBadge}>OD</span>
              <span className={styles.unsecuredBadge}>unsecured</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <p className={styles.heroEyebrow}>Your Pre-Approved</p>
            <h1 className={styles.heroTitle}>
              Dropline OD is Ready
            </h1>
            <p className={styles.heroSub}>
              Access upto 50 lakhs of flexible working capital in just a few simple steps
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeBadge}>PRE-APPROVED</div>
              <div className={styles.gaugeUp}>UP TO</div>
              <div className={styles.gaugeAmount}>
                <span className={styles.rupee}>₹</span>
                <span className={styles.amount}>50</span>
                <span className={styles.lakhs}>LAKHS</span>
              </div>
              <div className={styles.gaugeCheck}>✓</div>
            </div>
          </div>
        </div>

        {/* ── FEATURE PILLS ──────────────────────────── */}
        <div className={styles.features}>
          {[
            { icon: '📋', title: 'Paperless', desc: 'Fully digital application' },
            { icon: '⚡', title: 'Instant', desc: 'Pre-approved offer in minutes' },
            { icon: '🔒', title: 'Unsecured', desc: 'No collateral required' },
            { icon: '%', title: 'Economical', desc: 'Pay interest only on the amount drawn' },
          ].map((f) => (
            <div key={f.title} className={styles.featurePill}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CARD ──────────────────────────────────── */}
      <main className={styles.main}>

        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>

          {/* Step Progress Bar */}
          <div className={styles.stepBar}>
            {[
              { n: 1, label: 'Account type', active: true },
              { n: 2, label: 'Eligibility', active: false },
              { n: 3, label: 'Offer', active: false },
              { n: 4, label: 'Policy Rules', active: false },
              { n: 5, label: 'E-Sign', active: false },
              { n: 6, label: 'Activation', active: false },
            ].map((step, idx, arr) => (
              <div key={step.n} className={styles.stepItem}>
                <div className={`${styles.stepCircle} ${step.active ? styles.stepActive : styles.stepInactive}`}>
                  {step.active ? (
                    <span className={styles.stepIconActive}>🏦</span>
                  ) : (
                    <span>{step.n}</span>
                  )}
                </div>
                <span className={`${styles.stepLabel} ${step.active ? styles.stepLabelActive : ''}`}>
                  {step.label}
                </span>
                {idx < arr.length - 1 && (
                  <div className={styles.stepConnector}></div>
                )}
              </div>
            ))}
          </div>

          {/* Account Type Question */}
          <div className={styles.questionBlock}>
            <h2 className={styles.questionTitle}>Let's Get Started</h2>
            <p className={styles.questionSub}>What type of account you have?</p>

            <div className={styles.accountButtons}>
              <button
                className={styles.accountBtn}
                onClick={() => handleAccountType('current')}
              >
                Current
              </button>
              <button
                className={`${styles.accountBtn} ${styles.accountBtnSecondary}`}
                onClick={() => handleAccountType('savings')}
              >
                Saving
              </button>
            </div>

            <p className={styles.securityNote}>
              🔒 Your information is secure with us. We use advance encryption to protect your data.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — Key Features */}
        <div className={styles.rightPanel}>
          <h3 className={styles.keyFeaturesTitle}>Key Features</h3>
          <div className={styles.featuresList}>
            {[
              { icon: '⚡', text: 'Quick Digital Disbursement' },
              { icon: '%', text: 'Limits up to ₹50 Lakhs' },
              { icon: '📅', text: 'Up to 3 Years Repayment Tenure' },
              { icon: '📉', text: 'Reducing Dropline Structure' },
              { icon: '🔄', text: 'Annual Renewal' },
            ].map((f) => (
              <div key={f.text} className={styles.featureRow}>
                <div className={styles.featureRowIcon}>{f.icon}</div>
                <span className={styles.featureRowText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}