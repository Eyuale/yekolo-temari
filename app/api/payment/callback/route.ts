import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log("working")
  try {
    const { tx_ref, ref_id, status } = await req.json() as { tx_ref: string, ref_id: string, status: string };
    console.log(tx_ref, ref_id, status);
    
    // Validate required parameters
    if (!tx_ref || !ref_id || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log(`Received callback: tx_ref=${tx_ref}, ref_id=${ref_id}, status=${status}`);

    // Process the payment data (e.g., update database)
    // Example: await updatePaymentStatus(tx_ref, status);
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