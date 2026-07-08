'use client';

import { useRouter }   from 'next/navigation';
import HeaderSimple    from './components/HeaderSimple';
import styles          from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>

      <HeaderSimple />

      <main className={styles.main}>

        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className={styles.leftCol}>

          <p className={styles.welcomeText}>Welcome to ICICI Bank</p>
          <h1 className={styles.heroTitle}>
            Your Pre-approved<br />Dropline OD is Ready!
          </h1>
          <p className={styles.heroSub}>
            Complete the 100% digital journey in just a few simple steps.
          </p>

          {/* Pre-approved amount card */}
          <div className={styles.amountCard}>
            <div className={styles.amountCardIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div>
              <p className={styles.amountLabel}>Pre-approved up to</p>
              <p className={styles.amountValue}>₹50,00,000</p>
            </div>
          </div>

          {/* 4 Features strip */}
          <div className={styles.featuresStrip}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <circle cx="6.5" cy="6.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </div>
              <p className={styles.featureLabel}>Interest only{'\n'}on utilization</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <p className={styles.featureLabel}>100% Digital{'\n'}Process</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <p className={styles.featureLabel}>Flexible{'\n'}Repayment</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <p className={styles.featureLabel}>Quick Access{'\n'}to Funds</p>
            </div>
          </div>

          {/* Journey steps */}
          <div className={styles.journeyStrip}>
            <div className={styles.journeyItem}>
              <div className={styles.journeyIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                  <polyline points="16 10 12 6 8 10" />
                </svg>
              </div>
              <p className={styles.journeyLabel}>Review{'\n'}Offer</p>
              <div className={styles.journeyArrow}>→</div>
            </div>
            <div className={styles.journeyItem}>
              <div className={styles.journeyIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <polyline points="9 15 11 17 15 13" />
                </svg>
              </div>
              <p className={styles.journeyLabel}>Understand{'\n'}& Accept</p>
              <div className={styles.journeyArrow}>→</div>
            </div>
            <div className={styles.journeyItem}>
              <div className={styles.journeyIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <p className={styles.journeyLabel}>E-Sign{'\n'}Agreement</p>
              <div className={styles.journeyArrow}>→</div>
            </div>
            <div className={styles.journeyItem}>
              <div className={styles.journeyIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <p className={styles.journeyLabel}>Activate{'\n'}& Manage</p>
            </div>
          </div>

          <p className={styles.timeTip}>⏱ Takes about 3–4 minutes</p>

          <button className={styles.continueBtn} onClick={() => router.push('/login')}>
            Continue &nbsp;→
          </button>

        </div>

        {/* ── RIGHT COLUMN — Illustration ──────────────────────────── */}
        <div className={styles.rightCol}>
          <div className={styles.illustration}>

            <div className={styles.illustrationBg}></div>

            <div className={styles.docCard}>
              <div className={styles.docCheck}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className={styles.docLine} style={{ width: '80%', height: 10 }}></div>
              <div className={styles.docLine} style={{ width: '65%', height: 8 }}></div>
              <div className={styles.docRows}>
                <div className={styles.docRow}><div className={styles.docDot}></div><div className={styles.docLine} style={{ width: '60%', height: 7, margin: 0 }}></div></div>
                <div className={styles.docRow}><div className={styles.docDot}></div><div className={styles.docLine} style={{ width: '50%', height: 7, margin: 0 }}></div></div>
                <div className={styles.docRow}><div className={styles.docDot}></div><div className={styles.docLine} style={{ width: '55%', height: 7, margin: 0 }}></div></div>
              </div>
            </div>

            <div className={styles.shieldBadge}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>

            <span className={styles.sparkle} style={{ top: '8%', right: '10%' }}>✦</span>
            <span className={styles.sparkle} style={{ top: '18%', right: '4%', fontSize: '12px' }}>✦</span>
            <span className={styles.sparkle} style={{ bottom: '20%', right: '6%', fontSize: '10px' }}>✦</span>

          </div>
        </div>

      </main>
    </div>
  );
}