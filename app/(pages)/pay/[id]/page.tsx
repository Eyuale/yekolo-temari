"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

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

// Create a wrapper component to handle the client-side rendering
export default function Page({ params }: { params: { id: string } }) {
  return <PayPageContent params={params} />;
}

// Client component with the actual implementation
const PayPageContent = ({ params }: { params: { id: string } }) => {
  const { id } = params
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState("");
  const [tx_ref, setTxRef] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) {
            setCourse(null);
            return;
          }
          throw new Error("Failed to fetch course");
        }

        const courseData = await res.json();
        setCourse(courseData);
        setTxRef(`${courseData?.title}-${Date.now()}`);
      } catch (error) {
        console.error("Error:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.name) {
      const nameParts = session.user.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts[1] || "");
    }

    fetchCourse();
  }, [id, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course?.courseId,
          amount: course?.price,
          tx_ref: tx_ref,
          email: session?.user?.email,
          first_name: firstName,
          last_name: lastName,
          mobile: mobile,
          callback_url: `${process.env.NEXTAUTH_URL}/verify?courseId=${course?.courseId}&txRef=${tx_ref}`,
        }),
      });

      const data = await response.json();
      console.log("Payment response:", data);

      // Check if payment was successful and redirect to Chapa checkout
      if (data.responseData?.status === "success" && data.responseData?.data?.checkout_url) {
        window.location.href = data.responseData.data.checkout_url;
      } else {
        console.error("Payment initialization failed:", data);
        alert("Payment initialization failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Link
          href={course ? `/courses/${course.courseId}` : "/"}
          className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to course
        </Link>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading...</p>
          </div>
        ) : course ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Course Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>By {course.teacherName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                    <Image
                      src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${course.image}`}
                      alt={course.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Purchase</CardTitle>
                  <CardDescription>Secure checkout</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span>Course Price:</span>
                      <span className="font-medium">${course.price}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span>Total:</span>
                      <span className="font-bold">${course.price}</span>
                    </div>
                  </div>

                  {session ? (
                    <form onSubmit={handleSubmit}>
                      <Input type="text" placeholder="Enter your mobile number" onChange={(e) => setMobile(e.target.value)} />
                      <Button>Pay Now</Button>
                    </form>
                  ) : (
                    <div className="text-center p-4">
                      <p className="mb-4">
                        Please sign in to continue with your purchase
                      </p>
                      <Link
                        href={`/signin?callbackUrl=/pay/${course.courseId}`}
                      >
                        <Button>Sign In</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
                  <p>
                    By completing this purchase you agree to our Terms of
                    Service.
                  </p>
                  <p className="mt-2">Need help? Contact our support team.</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The course you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/">
              <Button>Browse Available Courses</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};
