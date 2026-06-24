// Shared header with application number — used on Offer Details, Sanction, Congratulations, Dashboard
'use client';

import { useState } from 'react';
import styles       from './Header.module.css';

export default function HeaderWithApp({ appNumber }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(appNumber || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logoGroup}>
          <img src="/icici-logo.png" alt="ICICI Bank" className={styles.iciciLogo} />
          <div className={styles.divider}></div>
          <div className={styles.brandBlock}>
            <span className={styles.brandName}>Dropline OD</span>
            <span className={styles.brandSub}>Unsecured Overdraft Facility</span>
          </div>
        </div>

        {/* Application number box — right side */}
        {appNumber && (
          <div className={styles.appNumBox}>
            <span className={styles.appNumLabel}>Application Number</span>
            <div className={styles.appNumRow}>
              <span className={styles.appNumValue}>{appNumber}</span>
              <button
                className={styles.copyBtn}
                onClick={handleCopy}
                title="Copy application number"
              >
                {copied ? '✓' : '⧉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}