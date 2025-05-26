import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongoose';
import Course from '@/models/courseModel';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/options';

export async function GET(){
  try {
    await dbConnect();
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .select('courseId title description image price teacherName');

    return NextResponse.json(courses);
  } catch(error){
    console.log('Error fetching courses: ', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get the current user session
    const session = await getServerSession(options);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Create a new course document
    const course = new Course({
      courseId: `COURSE_${Date.now()}`, // Generate a unique course ID
      teacherId: session.user?.email, // Use the teacher's email as ID
      teacherName: session.user?.name,
      title: data.title,
      description: data.description,
      image: data.thumbnailKey, // S3 key for the thumbnail
      video: data.videoKey, // S3 key for the video
      price: parseFloat(data.price),
      enrollments: [], // Initialize with empty enrollments
    });

    // Save the course to MongoDB
    const savedCourse = await course.save();

    return NextResponse.json(savedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}