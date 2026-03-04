import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/sign-in?error=missing_code`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[OAuth Callback] Error exchanging code:", error.message);
    return NextResponse.redirect(
      `${origin}/auth/sign-in?error=oauth_error`,
    );
  }

  // Check if the user had a priceIdToGo stored before the OAuth redirect
  const cookieStore = await cookies();
  const priceIdToGo = cookieStore.get("priceIdToGo")?.value;

  if (priceIdToGo) {
    // Clear the cookie
    cookieStore.delete("priceIdToGo");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

      try {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [{ price: priceIdToGo, quantity: 1 }],
          client_reference_id: user.id,
          success_url: `${appUrl}/admin/optical-shops`,
          cancel_url: `${appUrl}/billing?checkout=cancelled`,
          customer_email: user.email ?? undefined,
          subscription_data: {
            metadata: { userId: user.id },
          },
        });

        if (session.url) {
          return NextResponse.redirect(session.url);
        }
      } catch (err) {
        console.error("[OAuth Callback] Stripe checkout error:", err);
        // Fall through to default redirect
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/optical-shops`);
}
