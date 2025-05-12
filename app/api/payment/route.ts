import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongoose';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/options';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the current user session
    const session = await getServerSession(options);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      courseId,
      amount, 
      tx_ref,
      email,
      first_name,
      last_name,  
      mobile,
    } = await request.json();

    const header = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const body = {
      amount: amount,
      email: email,
      fist_name: first_name,
      last_name: last_name,
      tx_ref: tx_ref,
      mobile: mobile,
      currency: "ETB",
      callback_url: `${process.env.NEXTAUTH_URL}/verify?courseId=${courseId}&txRef=${tx_ref}`,
    }

    console.log(body.callback_url)

    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: header.headers,
      body: JSON.stringify(body)
    });
    const responseData = await response.json()

    

    return NextResponse.json({ responseData });
  } catch (error) {
    console.error('Error processing enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to process enrollment' },
      { status: 500 }
    );
  }
}
