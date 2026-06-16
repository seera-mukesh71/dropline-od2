import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return Response.json(
        { success: false, error: 'User ID and password are required.' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT
        customer_id,
        user_id,
        card_number,
        account_number,
        entity_name,
        offer_amount,
        tier,
        interest_rate,
        processing_fee,
        eligible,
        rejection_code
      FROM customers
      WHERE user_id  = ${userId.trim()}
        AND password = ${password}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Invalid User ID or Password. Please try again.' },
        { status: 401 }
      );
    }

    const customer = rows[0];

    return Response.json({
      success: true,
      customer: {
        customerId:     customer.customer_id,
        userId:         customer.user_id,
        cardNumber:     customer.card_number,
        accountNumber:  customer.account_number,
        entityName:     customer.entity_name,
        offerAmount:    customer.offer_amount,
        tier:           customer.tier,
        interestRate:   customer.interest_rate,
        processingFee:  customer.processing_fee,
        eligible:       customer.eligible,
        rejectionCode:  customer.rejection_code,
      },
    });

  } catch (err) {
    console.error('Login API error:', err);
    return Response.json(
      { success: false, error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}