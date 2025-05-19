import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

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
  enrollments: Array<{
    userId: string;
    enrolledAt?: Date;
    paymentReference?: string;
  }>;
}

async function getCourse(id: string): Promise<Course | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`, {
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

export default async function LearnPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  // Resolve the params promise
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Resolve searchParams promise
  const resolvedSearchParams = await searchParams;

  // Check if this is a new enrollment
  const isNewlyEnrolled = resolvedSearchParams.enrolled === 'true';

  // Get the current user session
  const session = await getServerSession(options);
  const userEmail = session?.user?.email;

  // If no user is logged in, redirect to login
  if (!userEmail) {
    redirect("/api/auth/signin?callbackUrl=" + encodeURIComponent(`/learn/${id}`));
  }

  // Get the course
  const course = await getCourse(id);

  // If course doesn't exist, show error
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

  // Check if the user is enrolled in the course
  const isEnrolled = course.enrollments.some(
    enrollment => enrollment.userId === userEmail
  );

  // If user is not enrolled, redirect to course page
  if (!isEnrolled) {
    redirect(`/courses/${id}?access=denied`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {isNewlyEnrolled && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-md">
            <p className="text-green-800 font-medium">
              🎉 Welcome to the course! You have successfully enrolled in &quot;{course.title}&quot;.
            </p>
          </div>
        )}

        <Link
          href={`/courses/${course.courseId}`}
          className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to course overview
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Left Column (3/4 width on large screens) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-2">
                By {course.teacherName}
              </p>
            </div>

            {/* Video Player */}
            <div className="rounded-lg overflow-hidden border">
              <VideoPlayer videoKey={course.video} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">About This Course</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </div>
          </div>

          {/* Course Progress - Right Column (1/4 width on large screens) */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Your Progress</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Enrolled</span>
                </div>

                {/* More progress items can be added here */}

                <div className="mt-6">
                  <Button className="w-full" variant="outline">
                    Mark as Completed
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
