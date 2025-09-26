import { clerkMiddleware } from "@clerk/nextjs/server";

// Only use Clerk middleware if we have real keys (not placeholders)
const hasRealKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder") &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes("placeholder");

export default hasRealKeys
  ? clerkMiddleware()
  : (req: any) => {
      // Skip Clerk middleware in development with placeholder keys
      return new Response(null, { status: 200 });
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
