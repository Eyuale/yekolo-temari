import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log("working")
  try {
    // Extract query parameters from the URL
    const searchParams = req.nextUrl.searchParams;
    const trx_ref = searchParams.get('tx_ref');
    const ref_id = searchParams.get('ref_id');
    const status = searchParams.get('status');

    // Validate required parameters
    if (!trx_ref || !ref_id || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log(`Received callback: trx_ref=${trx_ref}, ref_id=${ref_id}, status=${status}`);

    // Process the payment data (e.g., update database)
    // Example: await updatePaymentStatus(trx_ref, status);
    // Replace with your actual logic to handle the transaction

    // Acknowledge the callback
    return NextResponse.json(
      { message: 'Callback received' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
