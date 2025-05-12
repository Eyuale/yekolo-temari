import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { use } from "react";

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

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = await getCourse(id);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
            <p className="text-muted-foreground">
              The course you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details - Left Column (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${course.image}`}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-2">
                By {course.teacherName}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">About This Course</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            {/* Additional course details can be added here */}
          </div>

          {/* Purchase Card - Right Column (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-4">
              <div className="text-3xl font-bold mb-4">${course.price}</div>
              <Link href={`/pay/${course.courseId}`}>
              <Button className="w-full mb-4">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Enroll Now
              </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">This course includes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full lifetime access</li>
                  <li>Access on mobile and desktop</li>
                  <li>Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

