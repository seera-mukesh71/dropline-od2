'use client';
import HeaderWithApp from '../components/HeaderWithApp';


import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import styles                  from './dashboard.module.css';

const INTEREST_RATE  = 16.9;
const TENURE_MONTHS  = 12;

function formatINR(n) {
  return Number(n || 0).toLocaleString('en-IN');
}

function calcInterestAccrued(usedAmount, days) {
  return Math.round((usedAmount * (INTEREST_RATE / 100) * days) / 365);
}

function getValidityDate(activationDate, months) {
  const d = new Date(activationDate);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getNextDebitDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Circular arc SVG
function DonutChart({ pct, used, limit }) {
  const R   = 80;
  const C   = 2 * Math.PI * R;
  const arc = C * Math.min(pct / 100, 1);

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className={styles.donut}>
      {/* Track */}
      <circle cx="100" cy="100" r={R}
        fill="none" stroke="#f0f0f0" strokeWidth="18" />
      {/* Fill */}
      <circle cx="100" cy="100" r={R}
        fill="none"
        stroke="url(#odGrad)"
        strokeWidth="18"
        strokeDasharray={`${arc} ${C}`}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <defs>
        <linearGradient id="odGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#E84E20" />
          <stop offset="100%" stopColor="#FF7043" />
        </linearGradient>
      </defs>
      {/* Center text */}
      <text x="100" y="88"  textAnchor="middle" fontSize="11" fill="#888" fontFamily="Arial">Used Amount</text>
      <text x="100" y="108" textAnchor="middle" fontSize="15" fill="#E84E20" fontWeight="800" fontFamily="Arial">
        ₹ {formatINR(used)}
      </text>
      <text x="100" y="126" textAnchor="middle" fontSize="11" fill="#555" fontFamily="Arial">
        {pct.toFixed(2)}%
      </text>
      <text x="100" y="142" textAnchor="middle" fontSize="10" fill="#aaa" fontFamily="Arial">
        of sanctioned limit
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [customer,    setCustomer]    = useState(null);
  const [appNumber,   setAppNumber]   = useState('');
  const [actionHover, setActionHover] = useState(null);

  // Simulated OD usage — in real app this comes from DB
  const [usedAmount, setUsedAmount] = useState(0);
  const [daysElapsed, setDaysElapsed] = useState(0);

  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    const c = JSON.parse(s);
    setCustomer(c);

    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);

    // Simulate some usage for demo purposes
    const sanctioned = c.finalAmount || c.offerAmount || 0;
    setUsedAmount(Math.round(sanctioned * 0.298));  // ~29.8% used for demo
    setDaysElapsed(36);
  }, [router]);

  if (!customer) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const sanctioned      = customer.finalAmount || customer.offerAmount || 0;
  const available       = sanctioned - usedAmount;
  const usedPct         = sanctioned > 0 ? (usedAmount / sanctioned) * 100 : 0;
  const interestAccrued = calcInterestAccrued(usedAmount, daysElapsed);
  const activationDate  = new Date();
  const validityDate    = getValidityDate(activationDate, TENURE_MONTHS);
  const today           = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const nextDebit       = getNextDebitDate();

  const ACTIONS = [
    {
      id:    'renew',
      icon:  '🔄',
      title: 'Renew OD Facility',
      desc:  'Renew your OD facility before expiry to continue uninterrupted.',
      btn:   'Renew Now',
      color: '#C8102E',
      tip:   'Renewal is available 30 days before facility expiry. Your account conduct and credit score will be reviewed for renewal eligibility.',
    },
    {
      id:    'pay',
      icon:  '💳',
      title: 'Pay & Close OD',
      desc:  'Repay the entire outstanding and close your OD facility.',
      btn:   'Pay & Close Now',
      color: '#E84E20',
      tip:   'You can repay the full outstanding amount at any time. No prepayment charges apply. Once repaid, your OD limit will be closed.',
    },
    {
      id:    'close',
      icon:  '📄',
      title: 'Close OD Agreement',
      desc:  'Permanently close your OD agreement after full repayment.',
      btn:   'Close Agreement',
      color: '#C8102E',
      tip:   'This permanently closes your Dropline OD agreement. Ensure your outstanding balance is zero before initiating closure. An NOC will be issued.',
    },
  ];

  return (
    <div className={styles.pageWrapper}>

      {/* ── WHITE HEADER ─────────────────────────────────────────────── */}
      <HeaderWithApp appNumber={appNumber} />

      {/* ── RED NAV BAR ──────────────────────────────────────────────── */}
      <nav className={styles.navBar}>
        <span className={styles.navTitle}>Dropline OD Plus</span>
        <div className={styles.navRight}>
          <span className={styles.navLabel}>Application Number</span>
          <span className={styles.navAppNum}>{appNumber}</span>
          <button
            className={styles.logoutBtn}
            onClick={() => { sessionStorage.clear(); router.push('/'); }}
            title="Logout"
          >
            ⇥
          </button>
        </div>
      </nav>

      {/* ── PAGE BODY ────────────────────────────────────────────────── */}
      <div className={styles.pageBody}>

        {/* Page title row */}
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.pageTitle}>My Dropline OD Portfolio</h1>
            <p className={styles.pageSub}>Track and manage your Overdraft facility in one place.</p>
          </div>
          <div className={styles.statusBadge}>
            <span className={styles.statusLabel}>Status</span>
            <span className={styles.statusActive}>
              <span className={styles.statusDot}></span>
              Active
            </span>
          </div>
        </div>

        {/* ── STATS STRIP ──────────────────────────────────────────── */}
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>🏦</div>
            <div>
              <p className={styles.statLabel}>Sanctioned OD Limit</p>
              <p className={styles.statValue}>₹ {formatINR(sanctioned)}</p>
            </div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>%</div>
            <div>
              <p className={styles.statLabel}>Interest Rate (p.a.)</p>
              <p className={styles.statValue}>{INTEREST_RATE.toFixed(2)}%</p>
            </div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>📅</div>
            <div>
              <p className={styles.statLabel}>OD Tenure</p>
              <p className={styles.statValue}>{TENURE_MONTHS} Months</p>
            </div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>🗓</div>
            <div>
              <p className={styles.statLabel}>Facility Validity</p>
              <p className={styles.statValue}>{validityDate}</p>
            </div>
          </div>
        </div>

        {/* ── UTILIZATION SUMMARY ───────────────────────────────────── */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>OD Utilization Summary</h2>

          <div className={styles.utilizationGrid}>
            {/* Donut chart */}
            <div className={styles.donutWrap}>
              <DonutChart pct={usedPct} used={usedAmount} limit={sanctioned} />
            </div>

            {/* Right stats */}
            <div className={styles.utilizationStats}>
              {[
                { label: 'Available Limit',       val: `₹ ${formatINR(available)}`,       color: '#2E7D32' },
                { label: 'Total Used Amount',      val: `₹ ${formatINR(usedAmount)}`,      color: '#E84E20' },
                { label: 'Interest Accrued',       val: `₹ ${formatINR(interestAccrued)}`, color: '#E84E20', info: true },
                { label: 'Total Days Elapsed',     val: `${daysElapsed} Days`,             color: '#1a3a5c' },
                { label: 'Interest Till Date',     val: today,                              color: '#1a3a5c' },
                { label: 'Next Interest Debit Date', val: nextDebit,                        color: '#1a3a5c' },
              ].map(({ label, val, color, info }) => (
                <div key={label} className={styles.utilizationRow}>
                  <span className={styles.utilLabel}>
                    {label}
                    {info && <span className={styles.infoCircle} title="Interest is calculated daily on the utilised amount">ⓘ</span>}
                  </span>
                  <span className={styles.utilVal} style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── IMPORTANT ACTIONS ─────────────────────────────────────── */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Important Actions</h2>

          <div className={styles.actionsGrid}>
            {ACTIONS.map(action => (
              <div
                key={action.id}
                className={styles.actionCard}
                onMouseEnter={() => setActionHover(action.id)}
                onMouseLeave={() => setActionHover(null)}
              >
                {/* Tooltip on hover */}
                {actionHover === action.id && (
                  <div className={styles.tooltip}>
                    {action.tip}
                  </div>
                )}

                <div className={styles.actionTop}>
                  <div className={styles.actionIconWrap}>
                    <span className={styles.actionIcon}>{action.icon}</span>
                  </div>
                  <div>
                    <h3 className={styles.actionTitle}>{action.title}</h3>
                    <p className={styles.actionDesc}>{action.desc}</p>
                  </div>
                </div>

                <button
                  className={styles.actionBtn}
                  style={{ background: action.color }}
                  onMouseEnter={() => setActionHover(action.id)}
                >
                  {action.btn}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className={styles.footerNote}>
          <span className={styles.footerIcon}>ⓘ</span>
          <span>Interest is calculated daily on the utilised amount and debited monthly.</span>
        </div>

      </div>
    </div>
  );
}