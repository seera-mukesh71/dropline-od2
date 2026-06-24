// Shared simple header — used on Landing, Login, Policies pages
import styles from './Header.module.css';

export default function HeaderSimple() {
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
      </div>
    </header>
  );
}