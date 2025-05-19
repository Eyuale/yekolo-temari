"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Main page component that doesn't directly use useSearchParams
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

// Loading UI component
const LoadingUI = () => (
  <div className="flex min-h-screen flex-col items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <h1 className="mt-4 text-xl font-semibold">Processing your payment...</h1>
    <p className="mt-2 text-muted-foreground">You will be redirected to your course shortly.</p>
  </div>
);

// Client component with the actual implementation
const PaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a courseId in the URL
    const courseId = searchParams.get("courseId");
    const paymentStatus = searchParams.get("status");

    // If we have a courseId and payment was successful, redirect to the course page
    if (courseId && paymentStatus === "success") {
      router.push(`/courses/${courseId}?payment=success`);
    } else if (courseId) {
      // If we have a courseId but no success status, redirect to the course page anyway
      router.push(`/courses/${courseId}`);
    } else {
      // If we don't have a courseId, show an error
      setError("Missing course information. Please try again or contact support.");
      setIsLoading(false);
    }
  }, [router, searchParams]);

  if (isLoading) {
    return <LoadingUI />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Payment Processing Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
