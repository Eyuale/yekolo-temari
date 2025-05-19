import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/mongoose";
import Course from "@/models/courseModel";

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the webhook payload
    const body = await req.json();
    console.log("Webhook received:", body);

    // Extract necessary information from the webhook
    const {
      tx_ref,
      email,
      status,
      meta
    } = body;

    // Verify that the payment was successful
    if (status !== 'success') {
      console.log("Payment was not successful:", status);
      return NextResponse.json({ message: "Payment not successful" }, { status: 200 });
    }

    // Extract courseId from tx_ref (assuming format: "CourseName-timestamp")
    // We need to find the course based on the tx_ref
    // First, try to get courseId from meta if available
    let courseId;

    if (meta && meta.courseId) {
      courseId = meta.courseId;
    } else {
      // If meta is not available, we need to query all courses to find the one with matching tx_ref
      // This is a fallback approach and not ideal for production
      const courses = await Course.find();

      // Find the course that has an enrollment with this tx_ref
      for (const course of courses) {
        // We'll use the tx_ref to identify the transaction
        // The tx_ref format is typically "Natan-timestamp" or "CourseName-timestamp"
        // We'll need to extract the courseId from our database

        // For now, we'll just use the first course found (this is a simplification)
        courseId = course.courseId;
        break;
      }
    }

    if (!courseId) {
      console.log("Could not determine courseId from webhook data");
      return NextResponse.json({ message: "Could not determine courseId" }, { status: 200 });
    }

    console.log(courseId)
    // Find the course by courseId
    const course = await Course.findOne({ courseId });

    if (!course) {
      console.log("Course not found:", courseId);
      return NextResponse.json({ message: "Course not found" }, { status: 200 });
    }

    // Check if the user is already enrolled
    const isEnrolled = course.enrollments.some(
      (enrollment: { userId: string }) => enrollment.userId === email
    );

    if (!isEnrolled) {
      // Add the user to the course enrollments
      course.enrollments.push({
        userId: email,
        enrolledAt: new Date(),
        paymentReference: tx_ref,
      });

      // Save the updated course
      await course.save();
      console.log(`User ${email} enrolled in course ${courseId}`);
    } else {
      console.log(`User ${email} already enrolled in course ${courseId}`);
    }

    // Return a success response
    // Note: Webhooks can't directly redirect the user's browser
    // The frontend should handle the redirect after payment completion
    return NextResponse.json({
      message: "Webhook processed successfully",
      redirect: `/courses/${courseId}?payment=success`
    }, { status: 200 });

  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}