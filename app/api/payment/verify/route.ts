import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongoose';
import Course from '@/models/courseModel';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/[...nextauth]/options';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the current user session
    const session = await getServerSession(options);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, txRef } = await request.json();
    
    // Verify payment with Chapa (simplified for this example)
    // In a real implementation, you would call Chapa's verification API
    // const chapaResponse = await verifyPaymentWithChapa(txRef);
    
    // For now, we'll assume payment is successful
    await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
    
    // if (paymentSuccessful) {
    //   // Find the course and update enrollments
    //   const course = await Course.findOne({ courseId });
      
    //   if (!course) {
    //     return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    //   }
      
    //   // Check if user is already enrolled
    //   const alreadyEnrolled = course.enrollments.some(
    //     (enrollment: any) => enrollment.userId === session.user?.email
    //   );
      
    //   if (!alreadyEnrolled) {
    //     // Add user to enrollments
    //     await Course.findOneAndUpdate(
    //       { courseId },
    //       { $push: { enrollments: { userId: session.user.email } } }
    //     );
    //   }
      
    //   return NextResponse.json({ success: true, message: 'Enrollment successful' });
    // } else {
    //   return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    // }
    return NextResponse.json({ success: true, message: 'Enrollment successful' });
  } catch (error) {
    console.error('Error processing enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to process enrollment' },
      { status: 500 }
    );
  }
}