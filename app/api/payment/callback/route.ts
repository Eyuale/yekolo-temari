import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/mongoose";
import Course from "@/models/courseModel";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the URL parameters
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    const txRef = url.searchParams.get("txRef");
    const status = url.searchParams.get("status");
    
    console.log("Payment callback received:", { courseId, txRef, status });
    
    if (!courseId || !txRef) {
      console.log("Missing required parameters");
      // Redirect to error page
      return NextResponse.redirect(new URL("/payment-success?error=missing_params", req.url));
    }
    
    // Verify the payment status with Chapa (optional, can be done here or in the webhook)
    // For now, we'll assume the payment is successful if status is "success"
    
    if (status === "success") {
      // Find the course by courseId
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        console.log("Course not found:", courseId);
        return NextResponse.redirect(new URL(`/payment-success?error=course_not_found&courseId=${courseId}`, req.url));
      }
      
      // Redirect to the course page with success parameter
      return NextResponse.redirect(new URL(`/courses/${courseId}?payment=success`, req.url));
    } else {
      // Redirect to payment failure page
      return NextResponse.redirect(new URL(`/payment-success?status=failed&courseId=${courseId}`, req.url));
    }
  } catch (error) {
    console.error("Error handling payment callback:", error);
    return NextResponse.redirect(new URL("/payment-success?error=server_error", req.url));
  }
}
