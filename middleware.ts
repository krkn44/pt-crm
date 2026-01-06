import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get session token from cookies
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;
  const isAuth = !!sessionToken;

  const isAuthPage = pathname.startsWith("/auth");
  const isClientPage = pathname.startsWith("/client");
  const isTrainerPage = pathname.startsWith("/trainer");

  // Allow public routes
  if (!isAuthPage && !isClientPage && !isTrainerPage) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected routes, redirect to login
  if (!isAuth && (isClientPage || isTrainerPage)) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // If authenticated, fetch session once for both auth page check and role verification
  if (isAuth) {
    try {
      const sessionRes = await fetch(
        new URL("/api/auth/get-session", req.url),
        {
          headers: {
            cookie: req.headers.get("cookie") || "",
          },
        }
      );

      if (sessionRes.ok) {
        const session = await sessionRes.json();

        if (session?.user) {
          const userRole = session.user.role;

          // If on auth page while authenticated, redirect to appropriate dashboard
          if (isAuthPage) {
            const dashboardUrl = userRole === "TRAINER"
              ? "/trainer/dashboard"
              : "/client/workout";
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
          }

          // Check role-based access for protected routes
          if (isClientPage && userRole !== "CLIENT") {
            return NextResponse.redirect(new URL("/trainer/dashboard", req.url));
          }

          if (isTrainerPage && userRole !== "TRAINER") {
            return NextResponse.redirect(new URL("/client/workout", req.url));
          }
        }
      } else {
        // Session invalid, redirect to login if on protected routes
        if (isClientPage || isTrainerPage) {
          return NextResponse.redirect(
            new URL(`/auth/signin?from=${encodeURIComponent(pathname)}`, req.url)
          );
        }
      }
    } catch (error) {
      // If session fetch fails and on protected routes, redirect to login
      if (isClientPage || isTrainerPage) {
        return NextResponse.redirect(
          new URL(`/auth/signin?from=${encodeURIComponent(pathname)}`, req.url)
        );
      }
      // If on auth page and session fetch fails, allow access to auth page
      if (isAuthPage) {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/trainer/:path*", "/auth/:path*"],
};
