import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cardNumber, cardPin } = body;

    if (!cardNumber || !cardPin) {
      return Response.json(
        { success: false, error: 'Card number and PIN are required.' },
        { status: 400 }
      );
    }

    // Remove any spaces/dashes from card number before querying
    const cleanCard = cardNumber.replace(/\s+/g, '').replace(/-/g, '');

    if (cleanCard.length !== 16) {
      return Response.json(
        { success: false, error: 'Please enter a valid 16-digit card number.' },
        { status: 400 }
      );
    }

    if (cardPin.length !== 4) {
      return Response.json(
        { success: false, error: 'PIN must be exactly 4 digits.' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Match card_number AND card_pin from customers table
    const rows = await sql`
      SELECT
        customer_id,
        user_id,
        card_number,
        offer_amount,
        tier,
        interest_rate,
        processing_fee,
        eligible,
        rejection_code
      FROM customers
      WHERE card_number = ${cleanCard}
        AND card_pin    = ${cardPin}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Invalid card number or PIN. Please try again.' },
        { status: 401 }
      );
    }

    const customer = rows[0];

    return Response.json({
      success: true,
      customer: {
        customerId:    customer.customer_id,
        userId:        customer.user_id,
        cardNumber:    customer.card_number,
        offerAmount:   customer.offer_amount,
        tier:          customer.tier,
        interestRate:  customer.interest_rate,
        processingFee: customer.processing_fee,
        eligible:      customer.eligible,
        rejectionCode: customer.rejection_code,
      },
    });

  } catch (err) {
    console.error('Card login API error:', err);
    return Response.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
