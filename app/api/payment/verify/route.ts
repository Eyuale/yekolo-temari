import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import dbConnect from "@/utils/mongoose";
import Course from "@/models/courseModel";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    // Get the current user session
    const session = await getServerSession(options);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tx_ref, courseId } = await request.json() as { tx_ref: string, courseId: string } ;

    const header = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: header.headers,
    });

    const responseData = await response.json();


    if(responseData.status === "success"){
        // Find the course by courseId
        const course = await Course.findOne({ courseId });
        
        if (!course) {
          return NextResponse.json(
            { error: 'Course not found' },
            { status: 404 }
          );
        }
        
        // Check if the user is already enrolled
        const isEnrolled = course.enrollments.some(
          (enrollment: { userId: string }) => enrollment.userId === session.user?.email
        );

        if (!isEnrolled) {
          // Add the user to the course enrollments
          course.enrollments.push({
            userId: session.user.email,
            enrolledAt: new Date(),
            paymentReference: tx_ref,
            // You can add more payment details here if needed
          });
          
          // Save the updated course
          await course.save();
        }
        

      return NextResponse.json({ message: "Payment verified" });
    }else{
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    
    
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Internal Error" }, { status: 500})
  }
}
