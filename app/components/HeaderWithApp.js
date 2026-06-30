// Shared header with application number — used on Offer Details, Sanction, Congratulations, Dashboard
import styles from './Header.module.css';

export default function HeaderWithApp({ appNumber }) {
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

        {/* Application number — plain text, no copy button */}
        {appNumber && (
          <div className={styles.appNumBox}>
            <span className={styles.appNumLabel}>Application Number</span>
            <span className={styles.appNumValue}>{appNumber}</span>
          </div>
        )}
      </div>
    </header>
  );
}