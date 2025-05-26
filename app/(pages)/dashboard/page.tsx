import { options } from "@/app/api/auth/[...nextauth]/options";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";

interface Course {
  _id?: string; // MongoDB's default unique identifier
  courseId: string;
  title: string;
  description: string;
  image: string;
  price: number;
  teacherName: string;
  teacherId: string;
  video: string;
}

async function getCourses(): Promise<Course[]> {
  const session = await getServerSession(options);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.email}/courses`,
      {
        cache: "no-store", // Disable caching to always get fresh data
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch courses");
    }

    const data = await res.json();

    // Ensure each course has a unique ID for React keys
    return data.map((course: Partial<Course>, index: number) => ({
      ...course,
      // Use courseId if available, otherwise use _id, or as a last resort use index
      courseId: course.courseId || course._id || `course-${index}`,
    }));
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

const page = async () => {
  const courses = await getCourses();

  return (
    <div className="flex w-full h-screen justify-center items-center">
      {courses ? (
        <div className="flex flex-col gap-4">
          {courses.map((course: Course) => (
            <div key={course.courseId}>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <Button>
          <Link
            href="/dashboard/create-course"
            className="flex gap-2 flex-row items-center justify-center"
          >
            <Plus />
            Create Course
          </Link>
        </Button>
      )}
    </div>
  );
};

export default page;
