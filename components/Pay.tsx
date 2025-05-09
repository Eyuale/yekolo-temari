import React from "react";

interface PayProps {
    amount: number;
    currency: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    description: string;
    logo: string;
    callbackUrl: string;
    returnUrl: string;
    meta: string;
    courseId: string; // Add courseId prop
}

const Pay = ({
    amount,
    currency,
    email,
    firstName,
    lastName,
    title,
    courseId
}: PayProps) => {
  return (
    <div>
      <form method="POST" action="https://api.chapa.co/v1/hosted/pay">
        <input type="hidden" name="public_key" value={process.env.CHAPA_PUBLIC_KEY} />
        <input type="hidden" name="tx_ref" value={`${title}-${Date.now()}`} />
        <input type="hidden" name="amount" value={amount} />
        <input type="hidden" name="currency" value={currency} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="first_name" value={firstName} />
        <input type="hidden" name="last_name" value={lastName} />
        <input
          type="hidden"
          name="description"
          value="Paying with Confidence with cha"
        />
        <input
          type="hidden"
          name="logo"
          value="https://chapa.link/asset/images/chapa_swirl.svg"
        />
        <input
          type="hidden"
          name="callback_url"
          value={`${process.env.NEXTAUTH_URL}/api/payment/callback?courseId=${courseId}&txRef=${`${title}-${Date.now()}`}`}
        />
        <input
          type="hidden"
          name="return_url"
          value={`${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=success`}
        />
        <input type="hidden" name="meta[courseId]" value={courseId} />
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default Pay;
