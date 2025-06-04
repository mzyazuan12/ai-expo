import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route matchers
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/missions(.*)',
  '/admin(.*)'
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Define your specific admin user ID
  const adminUserId = "user_2y2H6vZzcLKxExPVCd7gZd9opPE"; // <<< REPLACE WITH YOUR ACTUAL CLERK USER ID

  // If it's a protected route, ensure user is authenticated
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Handle admin routes
    if (isAdminRoute(req)) {
      if (userId !== adminUserId) {
        console.log(`Unauthorized access attempt to /admin from user: ${userId}`);
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Admin user, allow access
      return NextResponse.next();
    }

    // Handle main app routes (dashboard, missions, etc.)
    const mainAppRoutes = ["/dashboard", "/missions"];
    const isMainAppRoute = mainAppRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    if (isMainAppRoute) {
      try {
        // Check if user is whitelisted
        const response = await fetch(`${req.nextUrl.origin}/api/whitelisted-users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const whitelistedUsers = Array.isArray(data) ? data : data.users || [];

        if (!whitelistedUsers.includes(userId)) {
          console.log(`Access denied to ${req.nextUrl.pathname} for non-whitelisted user: ${userId}`);
          return NextResponse.redirect(new URL("/access-denied", req.url));
        }

        // User is whitelisted, allow access
        return NextResponse.next();
      } catch (error) {
        console.error("Error checking whitelist for main app routes:", error);
        // On error, redirect to a safe page
        return NextResponse.redirect(new URL("/error", req.url));
      }
    }
  }

  // For public routes or non-protected routes, allow access
  return NextResponse.next();
});

export function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("adminToken");
    
    // If no admin token is found, redirect to admin login
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};