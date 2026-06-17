'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';
import styles                  from './congratulations.module.css';

export default function CongratulationsPage() {
  const router   = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    // Animate in after mount
    setTimeout(() => setVisible(true), 80);
  }, [router]);

  function handleContinue() {
    router.push('/dashboard');
  }

  return (
    <div className={styles.overlay}>
      {/* Confetti dots (pure CSS) */}
      <div className={styles.confettiWrap} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className={`${styles.dot} ${styles[`dot${i % 6}`]}`}
               style={{ left: `${(i * 5.5 + 3) % 100}%`, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>

      <div className={`${styles.card} ${visible ? styles.cardIn : ''}`}>
        {/* Top icon */}
        <div className={styles.iconRing}>
          <span className={styles.iconEmoji}>🎉</span>
        </div>

        <h1 className={styles.title}>Congratulations!</h1>

        <div className={styles.successBadge}>
          <span className={styles.successDot}></span>
          OD Facility Activated
        </div>

        <p className={styles.body}>
          Your <strong>Dropline OD</strong> facility is now <strong>active</strong> and ready to use.
          You can draw funds directly from your linked current account at any time.
        </p>

        <div className={styles.infoBox}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>💳 Access Via</span>
            <span className={styles.infoVal}>Your Current Account</span>
          </div>
          <div className={styles.infoDivider}></div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>⚡ Availability</span>
            <span className={styles.infoVal}>Instant — Active Now</span>
          </div>
          <div className={styles.infoDivider}></div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>💰 Interest</span>
            <span className={styles.infoVal}>Only on amount used</span>
          </div>
        </div>

        <button className={styles.ctaBtn} onClick={handleContinue}>
          View My OD Dashboard →
        </button>

        <p className={styles.note}>
          Manage, track, and repay your overdraft facility from your dashboard.
        </p>
      </div>
    </div>
  );
}