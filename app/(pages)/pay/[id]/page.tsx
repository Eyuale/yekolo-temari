import Pay from '@/components/Pay'
import { getSession } from 'next-auth/react';
import React from 'react'

// Define the Course interface
interface Course {
  _id?: string;
  courseId: string;
  title: string;
  description: string;
  image: string;
  video: string;
  price: number;
  teacherName: string;
  teacherId: string;
}


async function getCourse(id: string): Promise<Course | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/courses/${id}`, {
      cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch course');
    }

    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

const page = async ({ params }: {params: { id: string }}) => {
  const session = await getSession();
  const course = await getCourse(params.id);
  return (
    <div>
      {
        course ? (
          <Pay amount={course.price} currency="ETB" email={session?.user?.email || ''} firstName={session?.user?.name || ''} lastName={session?.user?.name || ''} title={course.title} callbackUrl="https://example.com/callbackurl" returnUrl="https://example.com/returnurl" meta="test" description="test" logo="https://chapa.link/asset/images/chapa_swirl.svg" />
        ):
        (
          <p>Course not found</p>
        )
      }
    </div>
  )
}

export default page