import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle, Play } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

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

export default async function CoursePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string, access?: string }>
}) {
  // Directly use the params without unwrapping with use()
  // Next.js 15 will handle this correctly
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const course = await getCourse(id);

  // Resolve searchParams promise
  const resolvedSearchParams = await searchParams;

  // Check if this is a redirect after payment
  const isPaymentSuccess = resolvedSearchParams.payment === 'success';

  // Check if this is a redirect after access denied
  const isAccessDenied = resolvedSearchParams.access === 'denied';

  // Get the current user session
  const session = await getServerSession(options);
  const userEmail = session?.user?.email;

  // Check if the user is already enrolled in the course
  const isEnrolled = userEmail && course?.enrollments?.some(
    enrollment => enrollment.userId === userEmail
  );

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
        {isPaymentSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-md">
            <p className="text-green-800 font-medium">
              🎉 Payment successful! You are now enrolled in this course.
            </p>
          </div>
        )}

        {isAccessDenied && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-800 font-medium">
              ⚠️ Access denied. You need to enroll in this course to access the learning materials.
            </p>
          </div>
        )}

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

              {isEnrolled ? (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-600">You are enrolled in this course</span>
                  </div>
                  <Link href={`/learn/${course.courseId}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Play className="mr-2 h-4 w-4" />
                      Start Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/pay/${course.courseId}`}>
                  <Button className="w-full mb-4">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Enroll Now
                  </Button>
                </Link>
              )}
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

