'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter }                                  from 'next/navigation';
import styles                                         from './sanction.module.css';

export default function SanctionPage() {
  const router = useRouter();

  // ── Session ───────────────────────────────────────────────────────────
  const [customer,  setCustomer]  = useState(null);
  const [appNumber, setAppNumber] = useState('');

  // ── Document checkboxes ───────────────────────────────────────────────
  const [kfsAgreed,    setKfsAgreed]    = useState(false);
  const [appFormAgreed, setAppFormAgreed] = useState(false);
  const [termsAgreed,  setTermsAgreed]  = useState(false);

  // ── PDF modal ─────────────────────────────────────────────────────────
  const [pdfModal,    setPdfModal]    = useState(null);  // null | 'KFS' | 'AppForm'
  const [pdfUrl,      setPdfUrl]      = useState('');
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [canAgree,     setCanAgree]     = useState(false);
  const [pdfReadTimer, setPdfReadTimer] = useState(0);
  const scrollRef                       = useRef(null);
  const timerRef                        = useRef(null);

  // ── Aadhaar + OTP ─────────────────────────────────────────────────────
  const [aadhaar,        setAadhaar]        = useState('');
  const [showAadhaar,    setShowAadhaar]    = useState(false);
  const [otp,            setOtp]            = useState('');
  const [otpSent,        setOtpSent]        = useState(false);
  const [otpVerified,    setOtpVerified]    = useState(false);
  const [maskedEmail,    setMaskedEmail]    = useState('');
  const [fullEmail,      setFullEmail]      = useState('');
  const [otpTimer,       setOtpTimer]       = useState(0);
  const [sendingOtp,     setSendingOtp]     = useState(false);
  const [verifyingOtp,   setVerifyingOtp]   = useState(false);
  const [aadhaarErr,     setAadhaarErr]     = useState('');
  const [otpErr,         setOtpErr]         = useState('');

  // ── Final consent + submit ────────────────────────────────────────────
  const [finalConsent, setFinalConsent] = useState(false);
  const [submitErr,    setSubmitErr]    = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  // ── Timer countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpTimer]);

  // PDF read timer — counts down, enables I Agree when reaches 0
  useEffect(() => {
    if (pdfReadTimer <= 0) return;
    timerRef.current = setTimeout(() => {
      setPdfReadTimer(t => {
        if (t <= 1) {
          setCanAgree(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [pdfReadTimer]);

  // ── Load session ──────────────────────────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem('odCustomer');
    if (!stored) { router.push('/'); return; }
    const c = JSON.parse(stored);
    setCustomer(c);
    const appNum = sessionStorage.getItem('appNumber') || 'CAODE000000';
    setAppNumber(appNum);
  }, [router]);

  // ── Open PDF modal ────────────────────────────────────────────────────
  async function openPdf(docType) {
    if (!customer) return;
    setPdfLoading(true);
    setCanAgree(false);
    setPdfReadTimer(0);
    clearTimeout(timerRef.current);
    setPdfModal(docType);

    try {
      const finalAmt = customer.finalAmount || customer.offerAmount;
      const res = await fetch('/api/generate-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          customerId:  customer.customerId,
          docType,
          finalAmount: finalAmt,
          appNumber,
        }),
      });

      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Start a 15-second countdown — after which I Agree becomes clickable
      // This simulates "must read the document" requirement
      setPdfReadTimer(15);

    } catch (err) {
      console.error(err);
      setPdfModal(null);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  }

  function closePdf() {
    clearTimeout(timerRef.current);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
    setPdfModal(null);
    setCanAgree(false);
    setPdfReadTimer(0);
  }

  function handleAgree() {
    if (pdfModal === 'KFS')     setKfsAgreed(true);
    if (pdfModal === 'AppForm') setAppFormAgreed(true);
    closePdf();
  }

  // ── Send OTP ──────────────────────────────────────────────────────────
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ customerId: customer.customerId }),
      });
      const data = await res.json();

      if (!data.success) { setAadhaarErr(data.error); return; }

      setMaskedEmail(data.maskedEmail);
      setFullEmail(data.fullEmail);
      setOtpSent(true);
      setOtpTimer(45);

    } catch {
      setAadhaarErr('Network error. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    setOtpErr('');
    if (otp.length !== 6) { setOtpErr('Please enter the 6-digit OTP.'); return; }

    setVerifyingOtp(true);
    try {
      const res  = await fetch('/api/verify-esign', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          customerId:    customer.customerId,
          aadhaarNumber: aadhaar.replace(/\s/g, ''),
          otp,
        }),
      });
      const data = await res.json();

      if (!data.success) { setOtpErr(data.error); return; }
      setOtpVerified(true);

    } catch {
      setOtpErr('Network error. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────
  async function handleResendOtp() {
    if (otpTimer > 0) return;
    setOtp('');
    setOtpErr('');
    setSendingOtp(true);
    try {
      const res  = await fetch('/api/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ customerId: customer.customerId }),
      });
      const data = await res.json();
      if (data.success) setOtpTimer(45);
    } catch {}
    finally { setSendingOtp(false); }
  }

  // ── Proceed to E-sign ─────────────────────────────────────────────────
  function handleProceed() {
    setSubmitErr('');
    if (!kfsAgreed)      { setSubmitErr('Please open and agree to the KFS document.'); return; }
    if (!appFormAgreed)  { setSubmitErr('Please open and agree to the Application Form.'); return; }
    if (!termsAgreed)    { setSubmitErr('Please tick the acknowledgement checkbox.'); return; }
    if (!otpVerified)    { setSubmitErr('Please complete Aadhaar verification and OTP.'); return; }
    if (!finalConsent)   { setSubmitErr('Please tick the final consent checkbox.'); return; }

    router.push('/congratulations');
  }

  // ── Aadhaar formatter ─────────────────────────────────────────────────
  function handleAadhaarInput(e) {
    const raw     = e.target.value.replace(/\D/g, '').slice(0, 12);
    const grouped = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setAadhaar(grouped);
    setAadhaarErr('');
  }

  if (!customer) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                    justifyContent:'center' }}>
        <div style={{ width:32, height:32, border:'3px solid #eee',
                      borderTopColor:'#E84E20', borderRadius:'50%',
                      animation:'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const displayAmount = customer.finalAmount || customer.offerAmount;

  return (
    <div className={styles.pageWrapper}>

      {/* ── RED HEADER BAR ───────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.logoGroup}>
              <span className={styles.logoCircle}>i</span>
              <span className={styles.logoBank}>ICICI Bank</span>
            </div>
            <div className={styles.headerDivider}></div>
            <div className={styles.logoDropline}>
              <span className={styles.dlText}>Dropline</span>
              <span className={styles.odBadge}>OD</span>
              <span className={styles.unsecBadge}>Unsecured</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.appLabel}>Application Number</span>
            <span className={styles.appValue}>{appNumber}</span>
          </div>
        </div>
      </header>

      {/* ── RED NAV BAR ──────────────────────────────────────────────── */}
      <nav className={styles.navBar}>
        <button className={styles.navBack} onClick={() => router.push('/offer-details')}>
          ‹ Dropline OD Plus
        </button>
        <div className={styles.navAppNum}>
          Application Number &nbsp;<strong>{appNumber}</strong>
        </div>
      </nav>

      {/* ── PAGE BODY ────────────────────────────────────────────────── */}
      <div className={styles.pageBody}>

        {/* Sanctioned header card */}
        <div className={styles.sanctionedCard}>
          <div className={styles.sanctionedLeft}>
            <span className={styles.sanctionedCheck}>✓</span>
            <h2 className={styles.sanctionedTitle}>Sanctioned</h2>
          </div>
          <div className={styles.sanctionedRight}>
            <p className={styles.sanctionedLabel}>Sanctioned Amount</p>
            <p className={styles.sanctionedAmount}>
              ₹{Number(displayAmount).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Instruction text */}
        <p className={styles.instruction}>
          Please read and agree to the following terms and conditions to proceed.
        </p>

        {/* ── Document checkboxes ──────────────────────────────────── */}
        <div className={styles.docList}>

          {/* KFS */}
          <div className={styles.docRow}>
            <input
              type="checkbox"
              className={styles.docCheckbox}
              checked={kfsAgreed}
              readOnly
              onClick={() => !kfsAgreed && openPdf('KFS')}
            />
            <button className={styles.docLink} onClick={() => openPdf('KFS')}>
              KFS
            </button>
            {kfsAgreed && <span className={styles.docAgreedBadge}>✓ Agreed</span>}
          </div>

          {/* Application Form */}
          <div className={styles.docRow}>
            <input
              type="checkbox"
              className={styles.docCheckbox}
              checked={appFormAgreed}
              readOnly
              onClick={() => !appFormAgreed && openPdf('AppForm')}
            />
            <button className={styles.docLink} onClick={() => openPdf('AppForm')}>
              Application Form, Most Important Terms &amp; Conditions, other documents
            </button>
            {appFormAgreed && <span className={styles.docAgreedBadge}>✓ Agreed</span>}
          </div>

          {/* Manual acknowledgement */}
          <div className={styles.docRow}>
            <input
              type="checkbox"
              className={styles.docCheckbox}
              checked={termsAgreed}
              onChange={e => setTermsAgreed(e.target.checked)}
            />
            <span className={styles.docText}>
              I acknowledge that I have read, understood and accepted the terms of the KFS
              (including the loan amount, tenure, interest, charges, etc.), Application Form,
              Schedule of Charges, debit mandate, consent clauses, Consumer education literature
              for concepts of special mention accounts (SMA) and non-performing assets (NPA)
              classification and Terms &amp; Conditions governing the Overdraft Facility.
            </span>
          </div>
        </div>

        {/* ── Aadhaar E-sign Section ────────────────────────────────── */}
        <div className={styles.esignSection}>
          <div className={styles.esignDivider}>
            <div className={styles.esignLine}></div>
            <h3 className={styles.esignTitle}>Aadhaar based E-sign</h3>
            <div className={styles.esignLine}></div>
          </div>

          <div className={styles.esignGrid}>

            {/* Box 1: Aadhaar */}
            <div className={styles.esignBox}>
              <div className={styles.esignStep}>
                <span className={styles.esignStepNum}>1</span>
                <span className={styles.esignStepLabel}>Enter your Aadhaar Number</span>
              </div>
              <div className={`${styles.esignInputWrap} ${aadhaarErr ? styles.inputErr : ''} ${otpVerified ? styles.inputVerified : ''}`}>
                <input
                  type={showAadhaar ? 'text' : 'password'}
                  className={styles.esignInput}
                  placeholder="Enter 12 digit Aadhaar number"
                  value={aadhaar}
                  onChange={handleAadhaarInput}
                  maxLength={14}
                  disabled={otpVerified}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowAadhaar(v => !v)}
                >
                  {showAadhaar ? '🙈' : '👁'}
                </button>
              </div>
              {aadhaarErr && <p className={styles.errMsg}>{aadhaarErr}</p>}

              {!otpSent && !otpVerified && (
                <button
                  className={styles.sendOtpBtn}
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP →'}
                </button>
              )}

              <div className={styles.esignInfoBox}>
                <span className={styles.infoIcon}>ℹ</span>
                <span>OTP will be sent to your registered email ID linked with Aadhaar.</span>
              </div>
            </div>

            {/* Box 2: OTP */}
            <div className={`${styles.esignBox} ${!otpSent ? styles.esignBoxDimmed : ''}`}>
              <div className={styles.esignStep}>
                <span className={styles.esignStepNum}>2</span>
                <span className={styles.esignStepLabel}>Enter OTP sent to your registered email ID</span>
              </div>
              <div className={`${styles.esignInputWrap} ${otpErr ? styles.inputErr : ''} ${otpVerified ? styles.inputVerified : ''}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.esignInput}
                  placeholder="Enter 6 digit OTP"
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setOtpErr(''); }}
                  maxLength={6}
                  disabled={!otpSent || otpVerified}
                />
              </div>
              {otpErr && <p className={styles.errMsg}>{otpErr}</p>}

              {otpSent && !otpVerified && (
                <>
                  <p className={styles.otpSentNote}>
                    OTP has been sent to <strong>{fullEmail}</strong>
                  </p>
                  <button
                    className={styles.verifyOtpBtn}
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
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
              )}

              {otpVerified && (
                <div className={styles.verifiedBadge}>
                  ✓ OTP Verified Successfully
                </div>
              )}
            </div>

          </div>{/* end esignGrid */}
        </div>

        {/* ── Final consent checkbox ────────────────────────────────── */}
        <div className={styles.finalConsentRow}>
          <input
            type="checkbox"
            className={styles.docCheckbox}
            checked={finalConsent}
            onChange={e => setFinalConsent(e.target.checked)}
          />
          <span className={styles.docText}>
            I hereby give my consent to proceed with Aadhaar based e-Sign on the Transaction Documents.
          </span>
        </div>

        {/* Error */}
        {submitErr && <div className={styles.submitErr}>⚠ {submitErr}</div>}

        {/* Proceed button */}
        <div className={styles.proceedWrap}>
          <button className={styles.proceedBtn} onClick={handleProceed}>
            Proceed to E-sign
          </button>
        </div>

      </div>{/* end pageBody */}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PDF MODAL                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {pdfModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>

            <button className={styles.modalClose} onClick={closePdf}>✕</button>

            {pdfLoading ? (
              <div className={styles.pdfLoading}>
                <div className={styles.pdfSpinner}></div>
                <p>Generating document…</p>
              </div>
            ) : (
              <>
                <div
                  className={styles.pdfScrollArea}
                  ref={scrollRef}
                >
                  <iframe
                    src={pdfUrl}
                    className={styles.pdfFrame}
                    title={pdfModal === 'KFS' ? 'Key Facts Statement' : 'Application Form'}
                  />
                </div>

                <div className={styles.modalFooter}>
                  {pdfReadTimer > 0 && (
                    <p className={styles.scrollHint}>
                      Please read the document. You can agree in{' '}
                      <strong style={{ color: '#E84E20' }}>{pdfReadTimer}s</strong>
                    </p>
                  )}
                  {pdfReadTimer === 0 && !canAgree && !pdfLoading && (
                    <p className={styles.scrollHint}>
                      Please wait while the document loads…
                    </p>
                  )}
                  {canAgree && (
                    <p className={styles.scrollHint} style={{ color: '#2E7D32' }}>
                      ✓ You can now agree to the document.
                    </p>
                  )}
                  <button
                    className={`${styles.agreeBtn} ${!canAgree ? styles.agreeBtnDisabled : ''}`}
                    onClick={handleAgree}
                    disabled={!canAgree}
                  >
                    I Agree ›
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
