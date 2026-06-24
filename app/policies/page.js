'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter }                   from 'next/navigation';
import styles                          from './policies.module.css';

export default function PoliciesPage() {
  const router    = useRouter();
  const scrollRef = useRef(null);

  // ── Customer from session ─────────────────────────────────────────────
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('odCustomer');
    if (!stored) { router.push('/'); return; }
    setCustomer(JSON.parse(stored));
  }, [router]);

  // ── MODAL state ───────────────────────────────────────────────────────
  const [showModal,     setShowModal]     = useState(true);
  const [loanAmount,    setLoanAmount]    = useState('');   // always blank — never pre-filled
  const [amountErr,     setAmountErr]     = useState('');
  const [amountConsent, setAmountConsent] = useState(false);

  // ── POLICY checkboxes ─────────────────────────────────────────────────
  const [privacyTicked, setPrivacyTicked] = useState(false);
  const [declareTicked, setDeclareTicked] = useState(null); // null | 'confirm' | 'not-confirm'
  const [policyErr,     setPolicyErr]     = useState('');

  // ── Loan amount constants — fixed product range, NOT customer offer ────
  const MIN  = 100000;   // ₹1,00,000  — product floor
  const MAX  = 5000000;  // ₹50,00,000 — product ceiling (not customer-specific)
  const STEP = 500;

  function formatINR(num) {
    return Number(num).toLocaleString('en-IN');
  }

  function handleAmountInput(e) {
    const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
    setLoanAmount(raw);
    setAmountErr('');
  }

  function validateAmount() {
    const num = parseInt(loanAmount, 10);
    if (!loanAmount || isNaN(num)) return 'Please enter a loan amount.';
    if (num < MIN)                 return 'Minimum amount is ₹1,00,000.';
    if (num > MAX)                 return 'Maximum amount is ₹50,00,000.';
    if (num % STEP !== 0)         return 'Amount must be in multiples of ₹500.';
    return '';
  }

  function handleModalContinue() {
    const err = validateAmount();
    if (err)            { setAmountErr(err); return; }
    if (!amountConsent) { setAmountErr('Please tick the consent checkbox to continue.'); return; }

    // Save only the customer's chosen amount — do NOT overwrite offerAmount
    const stored = JSON.parse(sessionStorage.getItem('odCustomer') || '{}');
    stored.chosenAmount = parseInt(loanAmount, 10);
    sessionStorage.setItem('odCustomer', JSON.stringify(stored));
    setShowModal(false);
  }

  // ── Accept / Decline ──────────────────────────────────────────────────
  function canAccept() {
    return privacyTicked && declareTicked === 'confirm';
  }

  function handleAccept() {
    if (!privacyTicked) {
      setPolicyErr('Please tick the Privacy Commitment consent to proceed.');
      return;
    }
    if (declareTicked !== 'confirm') {
      setPolicyErr('Please select "I confirm" under Additional Declarations to proceed.');
      return;
    }
    setPolicyErr('');
    router.push('/offer-details');
  }

  function handleDecline() {
    if (confirm('Are you sure you want to decline? Your application will be cancelled.')) {
      sessionStorage.clear();
      router.push('/');
    }
  }

  if (!customer) return null;

  return (
    <div className={styles.pageWrapper}>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoGroup}>
            <div className={styles.logoICICI}>
              <img src="/icici-logo.png" alt="ICICI Bank" className={styles.iciciLogoImg} />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.logoDropline}>
              <span className={styles.dlText}>Dropline</span>
              <span className={styles.odBadge}>OD</span>
              <span className={styles.unsecBadge}>Unsecured</span>
            </div>
          </div>
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: '40%' }}></div>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFillGray}></div>
            </div>
          </div>
        </div>
      </header>

      {/* ── BLURRED BACKGROUND when modal is open ────────────────────── */}
      <div className={`${styles.pageBody} ${showModal ? styles.blurred : ''}`}>
        <div className={styles.pageInner}>

          <button className={styles.backBtn} onClick={() => router.push('/login')}>
            ‹ Back
          </button>

          <div className={styles.pageTitle}>
            <h1>Declarations &amp; Consent</h1>
            <p className={styles.pageSub}>
              Please read all sections carefully and provide your consent to proceed.
            </p>
          </div>

          <div className={styles.policyCard} ref={scrollRef}>

            {/* ── Section 1: Privacy ───────────────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>1</span>
                <h2 className={styles.sectionTitle}>
                  Consent to ICICI Bank's Privacy Commitment
                </h2>
              </div>
              <div className={styles.sectionBody}>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    className={styles.policyCheckbox}
                    checked={privacyTicked}
                    onChange={e => { setPrivacyTicked(e.target.checked); setPolicyErr(''); }}
                  />
                  <span className={styles.checkText}>
                    I/We confirm having read and understood ICICI Bank&apos;s &quot;Privacy Commitment&quot; available at{' '}
                    <a href="https://www.icicibank.com/privacy" target="_blank" rel="noopener noreferrer" className={styles.link}>https://www.icicibank.com/privacy</a>.{' '}
                    I/We acknowledge that the same shall be subject to changes by ICICI Bank from time to time at its sole discretion and I/we agree to keep myself/ourselves updated with the same.
                  </span>
                </label>
              </div>
            </section>

            <div className={styles.sectionDivider}></div>

            {/* ── Section 2: Additional Declarations ───────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>2</span>
                <h2 className={styles.sectionTitle}>Additional Declarations</h2>
              </div>
              <div className={styles.sectionBody}>
                <p className={styles.declareIntro}><strong>a.</strong> I declare that:</p>
                <ul className={styles.declareList}>
                  <li>
                    I am not a director/relative of director of ICICI Bank/any other bank or
                    senior officer of ICICI Bank.
                  </li>
                  <li>
                    No director of the ICICI Bank is a manager, director, partner, managing
                    agent, employee or guarantor of the Borrower, or of a holding/subsidiary
                    of the Borrower or holds substantial interest in the Borrower or in a
                    holding/subsidiary of the Borrower and no director of any other bank,
                    subsidiary directors of subsidiaries of mutual funds/venture capital funds
                    set up by the ICICI Bank or any other bank holds substantial interest or
                    is interested as director/partner/manager or as a guarantor of the Borrower.
                  </li>
                  <li>
                    No relative (as specified by RBI) of a Chairman/Managing Director or
                    director of banking company (including the ICICI Bank) or their subsidiaries
                    or trustees of Mutual funds/Venture capital funds set up by a banking
                    company (including the ICICI Bank) or a relative of senior officer (as
                    specified by RBI) of the ICICI Bank, hold substantial interest or is
                    interested as a director/partner/manager or as guarantor of the Borrower.
                  </li>
                </ul>

                <div className={styles.radioGroup}>
                  <label className={`${styles.radioLabel} ${declareTicked === 'confirm' ? styles.radioSelected : ''}`}>
                    <input
                      type="radio"
                      name="declare"
                      value="confirm"
                      checked={declareTicked === 'confirm'}
                      onChange={() => { setDeclareTicked('confirm'); setPolicyErr(''); }}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    I confirm.
                  </label>
                  <label className={`${styles.radioLabel} ${declareTicked === 'not-confirm' ? styles.radioSelected : ''}`}>
                    <input
                      type="radio"
                      name="declare"
                      value="not-confirm"
                      checked={declareTicked === 'not-confirm'}
                      onChange={() => { setDeclareTicked('not-confirm'); setPolicyErr(''); }}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    I do not confirm.
                  </label>
                </div>

                {declareTicked === 'not-confirm' && (
                  <div className={styles.notConfirmWarn}>
                    ⚠ You must select "I confirm" to proceed with the application.
                  </div>
                )}

                <div className={styles.clauseBlock}>
                  <p>
                    <strong>b.</strong> The grant of overdraft facility is at the absolute
                    discretion of ICICI Bank ("Bank") and is subject to submission of requisite
                    documents and meeting Bank's eligibility criteria. The Bank reserves the
                    right at any time to modify/alter any of the terms &amp; conditions of the
                    facility. The applicant authorizes the Bank to assess the Credit Bureau
                    report of the Entity/Proprietor/Partner/Directors and to call, SMS or
                    communicate via WhatsApp. This consent overrides any registration for
                    DNC/NDNC.
                  </p>
                </div>
                <div className={styles.clauseBlock}>
                  <p>
                    <strong>c.</strong> With your consent your URC Number will be shared with
                    our partner Karza for Validation.
                  </p>
                </div>
              </div>
            </section>

            <div className={styles.sectionDivider}></div>

            {/* ── Section 3: Consent for Disclosure ────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>3</span>
                <h2 className={styles.sectionTitle}>Consent for Disclosure of Information</h2>
              </div>
              <div className={styles.sectionBody}>
                <p className={styles.bodyText}>
                  I/We hereby furnish my consent to ICICI Bank to share and/or fetch any of
                  my/our information (including my/our sensitive personal information, location
                  etc.) or any other device information when ICICI Bank considers such
                  disclosure/fetching as necessary, with/from:
                </p>
                <ul className={styles.disclosureList}>
                  <li><strong>a.</strong> Agents of ICICI Bank in any jurisdiction;</li>
                  <li>
                    <strong>b.</strong> Auditors, credit rating agencies/credit bureaus,
                    statutory/regulatory authorities, governmental/administrative authorities,
                    Central Know Your Customer (C-KYC) registry or SEBI Know Your Client
                    registration agency, having jurisdiction over ICICI Bank;
                  </li>
                  <li>
                    <strong>c.</strong> Service providers, professional advisors, consultants
                    or such person with whom ICICI Bank contracts or proposes to contract;
                  </li>
                </ul>
                <p className={styles.bodyText}>
                  (Collectively referred to as <strong>"Permitted Persons"</strong>)
                </p>
                <p className={styles.bodyText}>For the purposes of:</p>
                <ul className={styles.purposeList}>
                  <li><strong>a.</strong> Provision of the facility and completion of on-boarding formalities; or</li>
                  <li><strong>b.</strong> Complying with KYC/customer due diligence requirements, anti-money laundering checks; or</li>
                  <li><strong>c.</strong> Compliance with applicable laws or any order (judicial or otherwise), statutory/regulatory/legal requirement, including disclosure to information utilities; or</li>
                  <li><strong>d.</strong> Credit review of facilities availed; or</li>
                  <li><strong>e.</strong> Authentication or verification; or</li>
                  <li><strong>f.</strong> Research or analysis, credit reporting &amp; scoring, risk management, participation in any service-related communication; or</li>
                  <li><strong>g.</strong> Electronic clearing network and for use or processing of the said information/data; or</li>
                  <li><strong>h.</strong> Disclosing any default in payment; or</li>
                  <li><strong>i.</strong> Recovering the credit facilities including all interest and other charges.</li>
                </ul>
              </div>
            </section>

            <div className={styles.sectionDivider}></div>

            {/* ── Section 4: Camera/Microphone ─────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum}>4</span>
                <h2 className={styles.sectionTitle}>Consent for Camera/Microphone Access</h2>
              </div>
              <div className={styles.sectionBody}>
                <p className={styles.bodyText}>
                  I/We hereby authorize ICICI Bank to get a one-time access to my/our device's
                  camera and microphone for the purposes of on-boarding and KYC verification
                  which is required to be conducted to enable the ICICI Bank to provide the
                  credit facilities sought by me/us.
                </p>
                <p className={styles.bodyText}>
                  Applicable for NTB or non-KYC compliant customer. Since this is a one-time
                  consent, access should be disabled once on-boarding/KYC is completed.
                </p>
              </div>
            </section>

            {/* ── Policy error ──────────────────────────────────────── */}
            {policyErr && (
              <div className={styles.policyErrBanner}>
                ⚠ {policyErr}
              </div>
            )}

            {/* ── Accept / Decline ──────────────────────────────────── */}
            <div className={styles.actionRow}>
              <button
                className={`${styles.acceptBtn} ${!canAccept() ? styles.acceptDisabled : ''}`}
                onClick={handleAccept}
                disabled={!canAccept()}
              >
                <span className={styles.actionIcon}>✓</span>
                Accept
              </button>
              <button className={styles.declineBtn} onClick={handleDecline}>
                <span className={styles.actionIcon}>✕</span>
                Decline
              </button>
            </div>

            <p className={styles.acceptHint}>
              {!privacyTicked && !declareTicked &&
                'Tick Privacy Commitment and select "I confirm" above to enable Accept.'}
              {privacyTicked && declareTicked !== 'confirm' &&
                'Select "I confirm" under Additional Declarations to enable Accept.'}
              {!privacyTicked && declareTicked === 'confirm' &&
                'Tick Privacy Commitment above to enable Accept.'}
            </p>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LOAN AMOUNT MODAL                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>

            {/* Modal header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo}>
                <img
                  src="/icici-logo.png"
                  alt="ICICI Bank"
                  style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>

            <h2 className={styles.modalTitle}>
              Let's get started with your online<br />
              <span className={styles.modalTitleOrange}>Dropline OD Application</span>
            </h2>

            {/* ── Amount input — blank, no offer amount shown ────────── */}
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>
                Enter Loan Amount <span className={styles.req}>*</span>
              </label>
              <div className={`${styles.modalInputWrap} ${amountErr ? styles.modalInputErr : ''}`}>
                <span className={styles.modalRupee}>₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.modalInput}
                  placeholder="e.g. 5,00,000"
                  value={loanAmount ? formatINR(loanAmount) : ''}
                  onChange={handleAmountInput}
                  autoFocus
                />
              </div>
              {/* Fixed product range shown — NOT the customer's specific offer */}
              <p className={styles.modalHint}>
                Enter a value between ₹1,00,000 and ₹50,00,000 in multiples of ₹500
              </p>
              {amountErr && <p className={styles.modalErr}>{amountErr}</p>}
            </div>

            {/* Consent checkbox */}
            <label className={styles.modalCheckLabel}>
              <input
                type="checkbox"
                className={styles.modalCheckbox}
                checked={amountConsent}
                onChange={e => { setAmountConsent(e.target.checked); setAmountErr(''); }}
              />
              <span className={styles.modalCheckText}>
                I hereby allow ICICI Bank to show my personalized Dropline OD eligibility
                based on my online application.
              </span>
            </label>

            {/* Continue button */}
            <button
              className={styles.modalContinueBtn}
              onClick={handleModalContinue}
            >
              Continue →
            </button>

          </div>
        </div>
      )}

    </div>
  );
}