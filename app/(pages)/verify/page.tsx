"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

// Main page component that doesn't directly use useSearchParams
export default function Page() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <VerifyContent />
    </Suspense>
  );
}

// Loading UI component
const LoadingUI = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
      <p>Please wait while we confirm your payment.</p>
    </div>
  </div>
);

// Client component with the actual implementation
const VerifyContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams);
  const { courseId, txRef } = query;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tx_ref: txRef,
            courseId: courseId,
          }),
        });

        const data = await response.json();
        setIsLoading(false);
        if (data.error) {
          console.error("Error verifying payment:", data.error);
          alert("Error verifying payment. Please try again.");
        } else {
          console.log("Payment verified successfully:", data);
          alert("Payment verified successfully.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    };

    if (courseId && txRef) {
      verifyPayment();
    } else {
      setIsLoading(false);
      alert("Missing required parameters for payment verification.");
    }
  }, [courseId, txRef, router]);

  if(isLoading){
    return <LoadingUI />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Verification Complete</h1>
        <p className="mb-4">You can now access your course.</p>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Course
        </button>
      </div>
    </div>
  );
};
