import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongoose';
import Course from '@/models/courseModel';

export async function GET(
  _request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    await dbConnect();

    const { courseId } = await context.params;

    // Find the course by courseId
    const course = await Course.findOne({ courseId })

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
