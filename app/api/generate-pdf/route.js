// Force Node.js runtime — pdfkit needs fs, Buffer, streams
export const runtime = 'nodejs';

import { neon }       from '@neondatabase/serverless';
import PDFDocument     from 'pdfkit';

export async function POST(request) {
  try {
    // Read body ONCE
    const body = await request.json();
    const { customerId, docType, finalAmount, appNumber } = body;

    if (!customerId || !docType) {
      return new Response(
        JSON.stringify({ error: 'Missing parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql  = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT customer_id, user_id, entity_name, account_number,
             offer_amount, interest_rate, processing_fee, tier, email_id
      FROM customers
      WHERE customer_id = ${customerId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const c       = rows[0];
    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    // ── Build PDF entirely in memory ──────────────────────────────────
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const doc    = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data',  chunk => chunks.push(chunk));
      doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
      doc.on('error', err   => reject(err));

      // ── HEADER ──────────────────────────────────────────────────────
      doc
        .fontSize(18).font('Helvetica-Bold').fillColor('#C8102E')
        .text('ICICI Bank Limited', 50, 50);

      doc
        .fontSize(9).font('Helvetica').fillColor('#555')
        .text(`Date: ${dateStr}`, { align: 'right' })
        .text('IP Address: 10.78.11.210', { align: 'right' });

      doc.moveDown(0.8);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
      doc.moveDown(0.8);

      // ── DOCUMENT CONTENT ────────────────────────────────────────────
      if (docType === 'KFS') {
        buildKFS(doc, c, appNumber, finalAmount, dateStr);
      } else {
        buildAppForm(doc, c, appNumber, finalAmount, dateStr);
      }

      // ── FOOTER ──────────────────────────────────────────────────────
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e0e0e0').stroke();
      doc.moveDown(0.5);
      doc
        .fontSize(8).font('Helvetica-Bold').fillColor('#C8102E')
        .text('ICICI Bank Limited');
      doc
        .font('Helvetica').fillColor('#666')
        .text('ICICI Bank Tower, Bandra-Kurla Complex, Mumbai - 400 051, India.')
        .text('Website: www.icicibank.in   |   CIN: L65190GJ1994PLC021012')
        .text('Regd. Office: ICICI Bank Tower, Near Chakli Circle, Old Padra Road, Vadodara 390 007, India.');

      doc.end();
    });

    return new Response(pdfBuffer, {
      status:  200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `inline; filename="${docType}_${customerId}.pdf"`,
        'Content-Length':      String(pdfBuffer.length),
      },
    });

  } catch (err) {
    console.error('PDF generation error:', err);
    return new Response(
      JSON.stringify({ error: 'PDF generation failed: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── KFS Builder ────────────────────────────────────────────────────────────
function buildKFS(doc, c, appNumber, finalAmount, dateStr) {
  doc
    .fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a')
    .text('Annex A', { align: 'center' });
  doc
    .fontSize(14).font('Helvetica-Bold')
    .text('Key Facts Statement (KFS)', { align: 'center' });
  doc.moveDown(0.5);

  doc
    .fontSize(10).font('Helvetica').fillColor('#333')
    .text('Name of the Regulated entity: ICICI Bank Limited');
  doc.text(`Applicant Name: ${c.entity_name || c.user_id}`);
  doc.moveDown(0.5);

  doc
    .fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a')
    .text('Part 1 (Interest rate and fees/charges)', { align: 'center' });
  doc
    .fontSize(9).font('Helvetica').fillColor('#555')
    .text(
      'This KFS is generated for a Dropline OD product and shall lapse if the present application process is abandoned or discontinued.',
      { align: 'center' }
    );
  doc.moveDown(0.8);

  // Table rows
  const tableRows = [
    ['1', 'Loan proposal / account No.',           appNumber || c.customer_id, 'Type of Loan / Facility', 'Overdraft'],
    ['2', 'Sanctioned Loan / Limit amount (₹)',     `Rs. ${Number(c.offer_amount || 0).toLocaleString('en-IN')}`, '', ''],
    ['3', 'Disbursal schedule',                     '100% upfront (Limit setup)', '', ''],
    ['4', 'Rate of Interest (p.a.)',                `${c.interest_rate || 16.9}%`, 'Fixed Reset*', ''],
    ['5', 'Processing Fee',                         `${c.processing_fee || 2.0}% of sanctioned limit`, '', ''],
    ['6', 'Tenure',                                 '12 Months', '', ''],
    ['7', 'Validity',                               '1 Year (Annual Renewal)', '', ''],
    ['8', 'Prepayment charges',                     'Nil', '', ''],
  ];

  const tY = doc.y;
  const ROW_H = 26;

  tableRows.forEach(([num, label, val1, key2, val2], i) => {
    const y = tY + i * ROW_H;
    if (i % 2 === 0) {
      doc.rect(50, y, 495, ROW_H).fill('#f5f5f5');
    }
    doc.rect(50, y, 495, ROW_H).stroke('#cccccc');
    doc
      .fontSize(9).font('Helvetica-Bold').fillColor('#1a1a1a')
      .text(num,   55,  y + 8, { width: 20 });
    doc
      .font('Helvetica').fillColor('#333')
      .text(label, 75,  y + 8, { width: 190 });
    doc
      .font('Helvetica-Bold').fillColor('#1a1a1a')
      .text(val1,  270, y + 8, { width: 130 });
    if (key2) {
      doc.font('Helvetica').fillColor('#555').text(key2, 400, y + 8, { width: 80 });
    }
    if (val2) {
      doc.font('Helvetica').fillColor('#1a1a1a').text(val2, 480, y + 8, { width: 60 });
    }
  });

  doc.y = tY + tableRows.length * ROW_H + 16;
  doc.moveDown(1);

  // Charges section
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a1a').text('Part 2 — Schedule of Charges');
  doc.moveDown(0.4);
  doc
    .fontSize(9).font('Helvetica').fillColor('#333')
    .text('The following charges are applicable over and above the interest rate mentioned above:');
  doc.moveDown(0.4);

  const charges = [
    ['Cheque / NACH bounce charges',   'Rs. 500 per instance'],
    ['Duplicate statement charges',     'Rs. 100 per statement'],
    ['SWIFT charges',                   'Rs. 350'],
    ['International Courier charges',   'Rs. 1,000'],
    ['Registered post charges',         'NA'],
  ];

  charges.forEach(([label, value], i) => {
    const cy = doc.y;
    if (i % 2 === 0) doc.rect(50, cy, 495, 22).fill('#f9f9f9');
    doc.rect(50, cy, 495, 22).stroke('#dddddd');
    doc.fontSize(9).font('Helvetica').fillColor('#333').text(label, 56, cy + 6, { width: 280 });
    doc.font('Helvetica-Bold').fillColor('#1a1a1a').text(value, 340, cy + 6);
    doc.y = cy + 22;
  });

  doc.moveDown(1);
  doc
    .fontSize(8).font('Helvetica').fillColor('#888')
    .text('Note: GST and other Govt. taxes applicable as per prevailing rate will be charged over and above the mentioned charges.')
    .moveDown(0.3)
    .text('*Fixed reset, other than on account of changes in credit profile.')
    .moveDown(0.3)
    .text('The Dropline OD facility operates as a revolving credit line where the sanctioned limit reduces monthly by an equal amount over the tenure, reaching zero at maturity. Interest is charged only on the amount utilized.');
}

// ── Application Form Builder ────────────────────────────────────────────────
function buildAppForm(doc, c, appNumber, finalAmount, dateStr) {
  doc
    .fontSize(14).font('Helvetica-Bold').fillColor('#1a1a1a')
    .text('Application Form — Unsecured Dropline Overdraft Facility', { align: 'center' });
  doc
    .fontSize(10).font('Helvetica').fillColor('#555')
    .text('Most Important Terms & Conditions (MITC)', { align: 'center' });
  doc.moveDown(1);

  const fields = [
    ['Application Number',     appNumber || c.customer_id],
    ['Entity / Applicant Name', c.entity_name || c.user_id],
    ['Account Number',          c.account_number || 'N/A'],
    ['Customer ID',             c.customer_id],
    ['Date of Application',     dateStr],
    ['Facility Type',           'Unsecured Dropline Overdraft'],
    ['Sanctioned Limit (₹)',    `Rs. ${Number(c.offer_amount || 0).toLocaleString('en-IN')}`],
    ['Chosen OD Amount (₹)',    finalAmount ? `Rs. ${Number(finalAmount).toLocaleString('en-IN')}` : 'As per offer'],
    ['Rate of Interest',        `${c.interest_rate || 16.9}% p.a. (Fixed)`],
    ['Processing Fee',          `${c.processing_fee || 2.0}% of sanctioned limit`],
    ['Tenure',                  '12 Months'],
    ['Validity',                '1 Year (Annual Renewal)'],
    ['Customer Tier',           c.tier || 'Normal'],
    ['Prepayment Charges',      'Nil'],
  ];

  fields.forEach(([label, value], i) => {
    const fy = doc.y;
    if (i % 2 === 0) doc.rect(50, fy, 495, 24).fill('#f5f5f5');
    doc.rect(50, fy, 495, 24).stroke('#dddddd');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#555').text(label, 56, fy + 7, { width: 195 });
    doc.font('Helvetica').fillColor('#1a1a1a').text(String(value), 256, fy + 7, { width: 280 });
    doc.y = fy + 24;
  });

  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text('Most Important Terms & Conditions');
  doc.moveDown(0.4);

  const mitc = [
    '1. The Dropline OD facility is unsecured. No collateral or security is required.',
    '2. The sanctioned OD limit reduces each month by an equal amount over 12 months, reaching zero at maturity.',
    '3. Interest is charged only on the daily utilized balance at the rate mentioned above.',
    '4. The facility is valid for 1 year and subject to annual renewal based on account conduct and credit assessment.',
    '5. The Bank reserves the right to recall the facility at any time without prior notice if account conduct deteriorates.',
    '6. Any default in repayment will be reported to credit bureaus (CIBIL, CRIF, Experian, Equifax).',
    '7. Processing fee is deducted upfront at the time of limit activation from the linked current account.',
    '8. The borrower shall not create any charge or lien on assets without prior written approval from the Bank.',
    '9. The facility is subject to RBI guidelines on digital lending as applicable from time to time.',
    '10. Prepayment of outstanding balance is permitted at any time without any prepayment penalty.',
    '11. The Bank may alter interest rates on 30-day notice in the event of changes in credit profile.',
    '12. All disputes are subject to the jurisdiction of courts in Mumbai, Maharashtra.',
  ];

  mitc.forEach(line => {
    doc.fontSize(9).font('Helvetica').fillColor('#333').text(line).moveDown(0.25);
  });
}