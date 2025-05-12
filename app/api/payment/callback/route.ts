import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongoose';
import Course from '@/models/courseModel';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/[...nextauth]/options';

/**
 * This route handles the payment callback from Chapa payment gateway
 * It's called by Chapa after a payment is completed (successful or failed)
 * It updates the course enrollment status in the database
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Extract the courseId and txRef from the URL query parameters
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const txRef = url.searchParams.get('txRef');

    if (!courseId || !txRef) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the payment data from the request body (not used in this implementation)
    await request.json();

    // Verify the payment status
    // In a real implementation, you would verify the payment with Chapa's API
    // For now, we'll assume the payment is successful if we receive a callback

    // Get the current user session
    const session = await getServerSession(options);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the course by courseId
    const course = await Course.findOne({ courseId });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Define the enrollment interface
    interface Enrollment {
      userId: string;
      enrolledAt: Date;
      paymentReference: string;
    }

    // Check if the user is already enrolled
    const isEnrolled = course.enrollments.some(
      (enrollment: Enrollment) => enrollment.userId === session.user?.email
    );

    if (!isEnrolled) {
      // Add the user to the course enrollments
      course.enrollments.push({
        userId: session.user.email,
        enrolledAt: new Date(),
        paymentReference: txRef,
        // You can add more payment details here if needed
      });

      // Save the updated course
      await course.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment successful',
      courseId
    });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}

// This GET handler is for testing purposes only
// In production, you would only use the POST handler
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');
    const txRef = url.searchParams.get('txRef');

    if (!courseId || !txRef) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // For testing, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Test callback successful',
      courseId,
      txRef
    });
  } catch (error) {
    console.error('Error processing test callback:', error);
    return NextResponse.json(
      { error: 'Failed to process test callback' },
      { status: 500 }
    );
  }
}
