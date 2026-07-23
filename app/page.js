'use client';

import { useEffect }  from 'react';
import { useRouter }  from 'next/navigation';
import HeaderSimple   from './components/HeaderSimple';
import styles         from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    window.__chatbotPage = 'landing';
    const send = () => {
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'pagechange', page: 'landing' }, '*');
      }
    };
    send();
    setTimeout(send, 1000);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <HeaderSimple />

      <main className={styles.main}>

        {/* ── LEFT ─────────────────────────────────────────────────── */}
        <div className={styles.left}>

          <span className={styles.pill}>Pre-approved &amp; Ready</span>

          <h1 className={styles.title}>
            Your Dropline OD<br />
            <span className={styles.titleOrange}>is Ready for You</span>
          </h1>
          <p className={styles.sub}>
            100% paperless, branch-free activation in under 5 minutes —
            exclusively for ICICI current account holders.
          </p>

          {/* Offer badge */}
          <div className={styles.offerBadge}>
            <div className={styles.offerIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div>
              <p className={styles.offerLabel}>Pre-approved up to</p>
              <p className={styles.offerValue}>₹50,00,000</p>
            </div>
            <div className={styles.offerDivider}/>
            <div>
              <p className={styles.offerLabel}>Interest Rate</p>
              <p className={styles.offerRate}>16.9% p.a.</p>
            </div>
            <div className={styles.offerDivider}/>
            <div>
              <p className={styles.offerLabel}>Tenure</p>
              <p className={styles.offerRate}>36 Months</p>
            </div>
          </div>

          {/* 4 features */}
          <div className={styles.features}>
            {[
              { icon: '%',  label: 'Interest only\non utilization' },
              { icon: '💻', label: '100% Digital\nProcess' },
              { icon: '↗',  label: 'Flexible\nRepayment' },
              { icon: '₹',  label: 'Quick Access\nto Funds' },
            ].map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <p className={styles.featureLabel}>{f.label}</p>
              </div>
            ))}
          </div>

          {/* Journey steps */}
          <div className={styles.journey}>
            {[
              { num:'1', label:'Review Offer' },
              { num:'2', label:'Accept Terms' },
              { num:'3', label:'E-Sign' },
              { num:'4', label:'Activate' },
            ].map((step, i, arr) => (
              <div key={i} className={styles.journeyItem}>
                <div className={styles.journeyNum}>{step.num}</div>
                <p className={styles.journeyLabel}>{step.label}</p>
                {i < arr.length - 1 && <div className={styles.journeyArrow}>→</div>}
              </div>
            ))}
          </div>

          <p className={styles.timeTip}>⏱ Takes about 3–4 minutes · No branch visit needed</p>

          <button className={styles.ctaBtn} onClick={() => router.push('/login')}>
            Get Started &nbsp;→
          </button>

        </div>

        {/* ── RIGHT — illustration only, no text/numbers ────────────── */}
        <div className={styles.right}>
          <div className={styles.cardWrap}>

            {/* Soft radial bg */}
            <div className={styles.cardBg}/>

            {/* Central shield */}
            <div className={styles.shieldCenter}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>

            {/* Document card — top left */}
            <div className={styles.docCard} style={{ top:'8%', left:'6%' }}>
              <div className={styles.docCardLine} style={{ width:'80%' }}/>
              <div className={styles.docCardLine} style={{ width:'60%' }}/>
              <div className={styles.docCardLine} style={{ width:'70%' }}/>
              <div className={styles.docCardDot}/>
            </div>

            {/* Green tick — top right */}
            <div className={styles.iconBadge} style={{ top:'10%', right:'6%', background:'#E8F5E9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            {/* Orange clock — bottom left */}
            <div className={styles.iconBadge} style={{ bottom:'14%', left:'8%', background:'#FFF0EB' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E84E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>

            {/* Purple lock — bottom right */}
            <div className={styles.iconBadge} style={{ bottom:'10%', right:'8%', background:'#EDE7F6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <span className={styles.sparkle} style={{ top:'3%', left:'42%' }}>✦</span>
            <span className={styles.sparkle} style={{ bottom:'5%', right:'32%', fontSize:'10px' }}>✦</span>

          </div>
        </div>

      </main>
    </div>
  );
}