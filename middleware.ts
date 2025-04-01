import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don’t require authentication
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// Middleware config to control which routes it runs on
export const config = {
  matcher: [
    // Skip Next.js internals and static files unless in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run on API or trpc routes
    '/(api|trpc)(.*)',
  ],
}
