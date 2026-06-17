export const runtime = 'nodejs';
import { neon }       from '@neondatabase/serverless';
import nodemailer      from 'nodemailer';

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request) {
  try {
    const { customerId } = await request.json();
    if (!customerId) {
      return Response.json({ success: false, error: 'Customer ID required.' }, { status: 400 });
    }

    const sql  = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT customer_id, email_id, entity_name
      FROM customers WHERE customer_id = ${customerId} LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json({ success: false, error: 'Customer not found.' }, { status: 404 });
    }

    const customer = rows[0];
    if (!customer.email_id) {
      return Response.json({ success: false, error: 'No email registered for this customer.' }, { status: 400 });
    }

    const otp     = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in DB
    const expiresTimestamp = Date.now() + 30 * 60 * 1000;  // Unix ms, 30 min

    await sql`
      UPDATE customers
      SET otp_code    = ${otp},
          otp_expires = ${new Date(expiresTimestamp).toISOString()}
      WHERE customer_id = ${customerId}
    `;

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"ICICI Bank Dropline OD" <${process.env.GMAIL_USER}>`,
      to:      customer.email_id,
      subject: 'Your OTP for Aadhaar E-sign — ICICI Bank Dropline OD',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#C8102E;padding:20px 24px;">
            <h2 style="color:#fff;margin:0;font-size:18px;">ICICI Bank — Dropline OD</h2>
          </div>
          <div style="padding:28px 24px;">
            <p style="color:#333;font-size:14px;margin-bottom:8px;">
              Dear <strong>${customer.entity_name || customer.customer_id}</strong>,
            </p>
            <p style="color:#555;font-size:14px;margin-bottom:24px;">
              Your OTP for Aadhaar-based E-sign on the Transaction Documents is:
            </p>
            <div style="text-align:center;margin:24px 0;">
              <span style="font-size:38px;font-weight:900;letter-spacing:10px;color:#E84E20;background:#fff5f2;padding:14px 24px;border-radius:10px;border:2px dashed #E84E20;">
                ${otp}
              </span>
            </div>
            <p style="color:#888;font-size:12px;text-align:center;margin-top:16px;">
              This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
            </p>
            <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;">
            <p style="color:#aaa;font-size:11px;">
              If you did not initiate this request, please contact ICICI Bank immediately.<br>
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      `,
    });

    // Return masked email for display
    const emailParts = customer.email_id.split('@');
    const masked     = emailParts[0].slice(0, 4) + '****@' + emailParts[1];

    return Response.json({
      success:     true,
      maskedEmail: masked,
      fullEmail:   customer.email_id,
    });

  } catch (err) {
    console.error('Send OTP error:', err);
    return Response.json({ success: false, error: 'Failed to send OTP: ' + err.message }, { status: 500 });
  }
}