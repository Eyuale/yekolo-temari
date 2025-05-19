import { NextRequest } from "next/server";


export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        console.log("Webhook received:", body);
        return new Response("Webhook received", { status: 200 });
      } catch (error) {
        console.error("Error handling webhook:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
}