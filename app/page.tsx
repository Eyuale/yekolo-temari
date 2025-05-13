import Navbar from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";

// Define the Course interface
interface Course {
  _id?: string;  // MongoDB's default unique identifier
  courseId: string;
  title: string;
  description: string;
  image: string;
  price: number;
  teacherName: string;
}

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
      cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!res.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await res.json();

    // Ensure each course has a unique ID for React keys
    return data.map((course: Partial<Course>, index: number) => ({
      ...course,
      // Use courseId if available, otherwise use _id, or as a last resort use index
      courseId: course.courseId || course._id || `course-${index}`
    }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Available Courses
        </h1>

        {courses.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No courses available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: Course) => (
              <CourseCard
                key={course.courseId || course._id}
                id={course.courseId}
                title={course.title}
                description={course.description}
                image={course.image}
                price={course.price}
                teacherName={course.teacherName}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
