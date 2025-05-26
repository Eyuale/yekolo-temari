import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongoose';
import Course from '@/models/courseModel';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) { 
     // Resolve the params promise
    const params = await context.params;
    const { userId } = params;
    console.log(userId)
    
    const session = await getServerSession(options);
      if(!session){
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if(session.user?.email !== userId){
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  try {
    await dbConnect();
   

    // Find the course by courseId
    const course = await Course.findOne({ teacherId: userId })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
