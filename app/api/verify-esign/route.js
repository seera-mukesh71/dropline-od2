export const runtime = 'nodejs';

import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { customerId, aadhaarNumber, otp } = await request.json();

    if (!customerId || !aadhaarNumber || !otp) {
      return Response.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const sql  = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT
        aadhaar_number,
        otp_code,
        otp_expires,
        NOW() AS server_time
      FROM customers
      WHERE customer_id = ${customerId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Customer not found.' },
        { status: 404 }
      );
    }

    const c = rows[0];

    // ── Check Aadhaar ──────────────────────────────────────────────────
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '').trim();
    if (!c.aadhaar_number || c.aadhaar_number.trim() !== cleanAadhaar) {
      return Response.json(
        { success: false, error: 'Aadhaar number does not match our records.' },
        { status: 400 }
      );
    }

    // ── Check OTP exists ───────────────────────────────────────────────
    if (!c.otp_code) {
      return Response.json(
        { success: false, error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // ── Check OTP value ────────────────────────────────────────────────
    if (c.otp_code.trim() !== otp.trim()) {
      return Response.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // ── Check expiry using DB server time (avoids timezone issues) ─────
    // Compare directly in the database — no JS date math involved
    const expiryRows = await sql`
      SELECT
        otp_expires > NOW() AS is_valid
      FROM customers
      WHERE customer_id = ${customerId}
      LIMIT 1
    `;

    const isValid = expiryRows[0]?.is_valid;

    if (!isValid) {
      // Clear the expired OTP
      await sql`
        UPDATE customers
        SET otp_code = NULL, otp_expires = NULL
        WHERE customer_id = ${customerId}
      `;
      return Response.json(
        { success: false, error: 'OTP has expired. Please click Resend OTP to get a new one.' },
        { status: 400 }
      );
    }

    // ── All checks passed — clear OTP ─────────────────────────────────
    await sql`
      UPDATE customers
      SET otp_code = NULL, otp_expires = NULL
      WHERE customer_id = ${customerId}
    `;

    return Response.json({
      success: true,
      message: 'Verification successful.',
    });

  } catch (err) {
    console.error('Verify E-sign error:', err);
    return Response.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}