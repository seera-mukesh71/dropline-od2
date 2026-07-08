'use client';

import { useState, useEffect } from 'react';
import { useRouter }     from 'next/navigation';
import HeaderWithApp     from '../components/HeaderWithApp';
import styles            from './apply.module.css';

const POLICIES_CONTENT = `1. Consent to ICICI Bank's Privacy Commitment
I/We confirm having read and understood ICICI Bank's "Privacy Commitment" available at https://www.icicibank.com/privacy. I/We acknowledge that the same shall be subject to changes by ICICI Bank from time to time at its sole discretion and I/we agree to keep myself/ourselves updated with the same.

2. Additional Declarations
a. I declare that:
- I am not a director/relative of director of ICICI Bank/any other bank or senior officer of ICICI Bank.
- No director of the ICICI Bank is a manager, director, partner, managing agent, employee or guarantor of the Borrower, or of a holding/subsidiary of the Borrower or holds substantial interest, and no director of any other bank holds substantial interest or is interested as director/partner/manager or as a guarantor of the Borrower.
- No relative (as specified by RBI) of a Chairman/Managing Director or director of a banking company (including the ICICI Bank) hold substantial interest or is interested as a director/partner/manager or as guarantor of the Borrower.

b. The grant of overdraft facility is at the absolute discretion of ICICI Bank and is subject to submission of requisite documents and meeting Bank's eligibility criteria. The Bank reserves the right at any time to modify/alter any of the terms & conditions of the facility. The applicant authorizes the Bank to assess the Credit Bureau report and to call, SMS or communicate via WhatsApp. This consent overrides any registration for DNC/NDNC.

c. With your consent your URC Number will be shared with our partner Karza for Validation.

3. Consent for Disclosure of Information
I/We hereby furnish my consent to ICICI Bank to share and/or fetch any of my/our information (including sensitive personal information, location etc.) when ICICI Bank considers such disclosure/fetching as necessary, with Agents, Auditors, credit rating agencies, statutory/regulatory authorities, Service providers and professional advisors for the purposes of: provision of facility, KYC/AML compliance, applicable laws, credit review, authentication, research & analysis, electronic clearing network, disclosing defaults, and recovering credit facilities.

4. Consent for Camera/Microphone Access
I/We hereby authorize ICICI Bank to get a one-time access to my/our device's camera and microphone for on-boarding and KYC verification purposes. Since this is a one-time consent, access should be disabled once on-boarding/KYC is completed.`;

const KFS_CONTENT = `Annex A — Key Facts Statement (KFS)
Name of Regulated Entity: ICICI Bank Limited

Part 1: Interest Rate and Fees/Charges
- Type of Loan/Facility: Unsecured Dropline Overdraft
- Rate of Interest (p.a.): 16.9% Fixed
- Processing Fee: 2.3% of sanctioned limit (one-time, upfront)
- Tenure: 36 Months (Reducing Dropline)
- Disbursement: 100% upfront (Limit setup)
- Prepayment Charges: Nil

Part 2: Schedule of Charges
- Cheque/NACH bounce charges: Rs. 500 per instance
- Duplicate statement charges: Rs. 100 per statement
- SWIFT charges: Rs. 350
- International Courier charges: Rs. 1,000
- Registered post charges: NA

Note: GST and other Govt. taxes applicable as per prevailing rates will be charged over and above the mentioned charges.

The Dropline OD facility operates as a revolving credit line where the sanctioned limit reduces monthly by an equal amount over the tenure, reaching zero at maturity. Interest is charged only on the amount utilized.`;

const MITC_CONTENT = `Most Important Terms & Conditions (MITC) — Unsecured Dropline Overdraft Facility

1. The Dropline OD facility is unsecured. No collateral or security is required.
2. The sanctioned OD limit reduces each month by an equal amount over 36 months, reaching zero at maturity.
3. Interest is charged only on the daily utilized balance at 16.9% p.a.
4. The facility is valid for 1 year and subject to annual renewal based on account conduct and credit assessment.
5. The Bank reserves the right to recall the facility at any time without prior notice if account conduct deteriorates.
6. Any default in repayment will be reported to credit bureaus (CIBIL, CRIF, Experian, Equifax).
7. Processing fee of 2.3% is deducted upfront at the time of limit activation from the linked current account.
8. The borrower shall not create any charge or lien on assets without prior written approval from the Bank.
9. The facility is subject to RBI guidelines on digital lending as applicable from time to time.
10. Prepayment of outstanding balance is permitted at any time without any prepayment penalty.
11. The Bank may alter interest rates on 30-day notice in the event of changes in credit profile.
12. All disputes are subject to the jurisdiction of courts in Mumbai, Maharashtra.`;

export default function ApplyPage() {
  const router = useRouter();

  const [customer,  setCustomer]  = useState(null);
  const [appNumber, setAppNumber] = useState('');

  useEffect(() => {
    const s = sessionStorage.getItem('odCustomer');
    if (!s) { router.push('/'); return; }
    setCustomer(JSON.parse(s));
    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);
  }, [router]);

  // ── Accordion — only 3 items now ─────────────────────────────────────
  const [openSection, setOpenSection] = useState(null);
  function toggleSection(id) {
    setOpenSection(prev => prev === id ? null : id);
  }

  // ── PDF download ──────────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(null);
  async function handleDownload(docType) {
    if (!customer) return;
    setDownloading(docType);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId:  customer.customerId,
          docType,
          finalAmount: customer.finalAmount || customer.offerAmount,
          appNumber,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${docType}_${appNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Could not download. Please try again.'); }
    finally { setDownloading(null); }
  }

  // ── Aadhaar + OTP ─────────────────────────────────────────────────────
  const [aadhaar,      setAadhaar]      = useState('');
  const [showAadhaar,  setShowAadhaar]  = useState(false);
  const [aadhaarErr,   setAadhaarErr]   = useState('');
  const [otpDigits,    setOtpDigits]    = useState(['','','','','','']);
  const [otpSent,      setOtpSent]      = useState(false);
  const [otpVerified,  setOtpVerified]  = useState(false);
  const [fullEmail,    setFullEmail]    = useState('');
  const [otpTimer,     setOtpTimer]     = useState(0);
  const [sendingOtp,   setSendingOtp]   = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpErr,       setOtpErr]       = useState('');
  const [finalConsent, setFinalConsent] = useState(false);
  const [submitErr,    setSubmitErr]    = useState('');

  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpTimer]);

  function handleAadhaarInput(e) {
    const raw     = e.target.value.replace(/\D/g, '').slice(0, 12);
    const grouped = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setAadhaar(grouped);
    setAadhaarErr('');
  }

  function handleOtpChange(index, value) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpErr('');
    if (value && index < 5) document.getElementById(`otp-box-${index + 1}`)?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-box-${index - 1}`)?.focus();
    }
  }

  async function handleSendOtp() {
    setAadhaarErr('');
    const clean = aadhaar.replace(/\s/g, '');
    if (clean.length !== 12 || !/^\d{12}$/.test(clean)) {
      setAadhaarErr('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setSendingOtp(true);
    try {
      const res  = await fetch('/api/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.customerId }),
      });
      const data = await res.json();
      if (!data.success) { setAadhaarErr(data.error); return; }
      setFullEmail(data.fullEmail);
      setOtpSent(true);
      setOtpTimer(45);
    } catch { setAadhaarErr('Network error. Please try again.'); }
    finally { setSendingOtp(false); }
  }

  async function handleResendOtp() {
    if (otpTimer > 0) return;
    setOtpDigits(['','','','','','']);
    setOtpErr('');
    setSendingOtp(true);
    try {
      const res  = await fetch('/api/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.customerId }),
      });
      const data = await res.json();
      if (data.success) { setFullEmail(data.fullEmail); setOtpTimer(45); }
    } catch {}
    finally { setSendingOtp(false); }
  }

  async function handleEsignContinue() {
    setSubmitErr('');
    const otpStr = otpDigits.join('');
    if (!otpSent)          { setSubmitErr('Please enter your Aadhaar number and send OTP first.'); return; }
    if (otpStr.length < 6) { setSubmitErr('Please enter the complete 6-digit OTP.'); return; }
    if (!finalConsent)     { setSubmitErr('Please tick the consent checkbox to proceed.'); return; }
    setVerifyingOtp(true);
    try {
      const res  = await fetch('/api/verify-esign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId:    customer.customerId,
          aadhaarNumber: aadhaar.replace(/\s/g, ''),
          otp:           otpStr,
        }),
      });
      const data = await res.json();
      if (!data.success) { setSubmitErr(data.error); return; }
      router.push('/dashboard');
    } catch { setSubmitErr('Network error. Please try again.'); }
    finally { setVerifyingOtp(false); }
  }

  if (!customer) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const SECTIONS = [
    { id: 'policies', icon: '📋', title: 'Policies',
      sub: 'Read all the important policies and guidelines.', body: POLICIES_CONTENT },
    { id: 'kfs', icon: '📄', title: 'Key Fact Statement (KFS)',
      sub: 'Important details about charges, fees and key facts.', body: KFS_CONTENT },
    { id: 'mitc', icon: '📃', title: 'Most Important Terms & Conditions (MITC)',
      sub: 'Read the most important terms and conditions.', body: MITC_CONTENT },
  ];

  const maskedAadhaar = aadhaar
    ? 'XXXX XXXX ' + aadhaar.replace(/\s/g, '').slice(-4)
    : '';

  return (
    <div className={styles.pageWrapper}>

      <HeaderWithApp appNumber={appNumber} />

      <div className={styles.bg}>
        <div className={styles.pageInner}>
          <div className={styles.mainCard}>

            <h2 className={styles.cardTitle}>Understand Before You Accept</h2>
            <p className={styles.cardSub}>Please read the key terms of your Dropline OD.</p>

            {/* ── 3 ACCORDION SECTIONS ──────────────────────────────── */}
            <div className={styles.accordionList}>
              {SECTIONS.map(sec => (
                <div key={sec.id} className={styles.accordionItem}>
                  <button
                    className={`${styles.accordionHead} ${openSection === sec.id ? styles.accordionHeadOpen : ''}`}
                    onClick={() => toggleSection(sec.id)}
                  >
                    <div className={styles.accordionLeft}>
                      <div className={styles.accordionIcon}>{sec.icon}</div>
                      <div>
                        <p className={styles.accordionTitle}>{sec.title}</p>
                        <p className={styles.accordionSub}>{sec.sub}</p>
                      </div>
                    </div>
                    <span className={`${styles.chevron} ${openSection === sec.id ? styles.chevronOpen : ''}`}>›</span>
                  </button>
                  {openSection === sec.id && (
                    <div className={styles.accordionBody}>
                      <pre className={styles.accordionText}>{sec.body}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── DOWNLOAD STRIP ────────────────────────────────────── */}
            <div className={styles.downloadStrip}>
              <div className={styles.downloadStripLeft}>
                <span className={styles.downloadInfoIcon}>ⓘ</span>
                <span>
                  Please read the Key Fact Statement (KFS) and Most Important
                  Terms &amp; Conditions (MITC) for detailed information.
                </span>
              </div>
              <div className={styles.downloadBtns}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownload('KFS')}
                  disabled={downloading === 'KFS'}
                >
                  ↓ {downloading === 'KFS' ? 'Downloading…' : 'Download KFS'}
                </button>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownload('AppForm')}
                  disabled={downloading === 'AppForm'}
                >
                  ↓ {downloading === 'AppForm' ? 'Downloading…' : 'Download MITC'}
                </button>
              </div>
            </div>

            {/* ── E-SIGN SECTION — always visible, no accordion ────── */}
            <div className={styles.esignSection}>
              <div className={styles.esignSectionHead}>
                <div className={styles.esignHeadIcon}>✍️</div>
                <div>
                  <h3 className={styles.esignTitle}>E-Sign the Agreement</h3>
                  <p className={styles.esignSub}>
                    You are one step away from activating your Dropline OD.
                  </p>
                </div>
              </div>

              <div className={styles.esignGrid}>

                {/* LEFT: Aadhaar */}
                <div className={styles.esignLeft}>
                  <p className={styles.esignFieldLabel}>Aadhaar Number</p>
                  {!otpVerified ? (
                    <>
                      <div className={`${styles.aadhaarInputWrap} ${aadhaarErr ? styles.inputErr : ''} ${otpSent ? styles.inputVerified : ''}`}>
                        <input
                          type={showAadhaar ? 'text' : 'password'}
                          className={styles.aadhaarInput}
                          placeholder="Enter 12 digit Aadhaar number"
                          value={aadhaar}
                          onChange={handleAadhaarInput}
                          maxLength={14}
                          disabled={otpSent}
                        />
                        <button type="button" className={styles.eyeBtn}
                          onClick={() => setShowAadhaar(v => !v)}>
                          {showAadhaar ? '🙈' : '👁'}
                        </button>
                        {otpSent && (
                          <span className={styles.verifiedBadge}>✓ Verified</span>
                        )}
                      </div>
                      {aadhaarErr && <p className={styles.errMsg}>{aadhaarErr}</p>}
                      {!otpSent && (
                        <button className={styles.sendOtpBtn} onClick={handleSendOtp} disabled={sendingOtp}>
                          {sendingOtp ? 'Sending OTP…' : 'Send OTP →'}
                        </button>
                      )}
                      {!otpSent && (
                        <p className={styles.aadhaarHint}>
                          ⓘ OTP will be sent to your registered email ID.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className={styles.aadhaarMaskedWrap}>
                      <span className={styles.aadhaarMasked}>{maskedAadhaar}</span>
                      <span className={styles.verifiedBadge}>✓ Verified</span>
                    </div>
                  )}
                </div>

                {/* RIGHT: OTP — visible only after OTP is sent */}
                <div className={`${styles.esignRight} ${!otpSent ? styles.esignRightHidden : ''}`}>
                  {otpSent && (
                    <>
                      <p className={styles.esignFieldLabel}>Enter OTP</p>
                      <p className={styles.otpSentNote}>
                        We have sent a 6 digit OTP to{' '}
                        <strong>{fullEmail}</strong>
                      </p>

                      {!otpVerified ? (
                        <>
                          <div className={styles.otpBoxRow}>
                            {otpDigits.map((d, i) => (
                              <input
                                key={i}
                                id={`otp-box-${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className={`${styles.otpBox} ${otpErr ? styles.otpBoxErr : ''}`}
                                value={d}
                                onChange={e => handleOtpChange(i, e.target.value)}
                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                autoComplete="off"
                              />
                            ))}
                          </div>
                          {otpErr && <p className={styles.errMsg}>{otpErr}</p>}
                          <button
                            className={`${styles.resendBtn} ${otpTimer > 0 ? styles.resendDisabled : ''}`}
                            onClick={handleResendOtp}
                            disabled={otpTimer > 0 || sendingOtp}
                          >
                            {otpTimer > 0
                              ? `Resend OTP in 0:${String(otpTimer).padStart(2,'0')}`
                              : 'Resend OTP'}
                          </button>
                        </>
                      ) : (
                        <div className={styles.otpVerifiedBadge}>
                          ✓ OTP Verified Successfully
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* ── FINAL CONSENT CHECKBOX ───────────────────────────── */}
            <div className={styles.consentRow}>
              <input
                type="checkbox"
                id="final-consent"
                className={styles.consentCheckbox}
                checked={finalConsent}
                onChange={e => setFinalConsent(e.target.checked)}
              />
              <label htmlFor="final-consent" className={styles.consentLabel}>
                I confirm that I have read and understood the terms and conditions
                and agree to e-sign the documents.
              </label>
            </div>

            {submitErr && <div className={styles.submitErr}>⚠ {submitErr}</div>}

            {/* ── BACK + E-SIGN CONTINUE ───────────────────────────── */}
            <div className={styles.actionRow}>
              <button className={styles.backBtn} onClick={() => router.push('/offer')}>
                ← Back
              </button>
              <button
                className={styles.esignBtn}
                onClick={handleEsignContinue}
                disabled={verifyingOtp}
              >
                {verifyingOtp
                  ? <span className={styles.btnSpinner}></span>
                  : 'e-Sign & Continue →'}
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}