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

  // If accessing auth pages while authenticated, redirect to dashboard
  if (isAuthPage && isAuth) {
    // We need to fetch session to know the role
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
          const dashboardUrl = session.user.role === "TRAINER"
            ? "/trainer/dashboard"
            : "/client/dashboard";
          return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }
      }
    } catch (error) {
      // If session fetch fails, continue to auth page
      return NextResponse.next();
    }
  }

  // If not authenticated and trying to access protected routes
  if (!isAuth && (isClientPage || isTrainerPage)) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // If authenticated, verify role-based access
  if (isAuth && (isClientPage || isTrainerPage)) {
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

          // Redirect if accessing wrong area
          if (isClientPage && userRole !== "CLIENT") {
            return NextResponse.redirect(new URL("/trainer/dashboard", req.url));
          }

          if (isTrainerPage && userRole !== "TRAINER") {
            return NextResponse.redirect(new URL("/client/dashboard", req.url));
          }
        }
      } else {
        // Session invalid, redirect to login
        return NextResponse.redirect(
          new URL(`/auth/signin?from=${encodeURIComponent(pathname)}`, req.url)
        );
      }
    } catch (error) {
      // If session verification fails, redirect to login
      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/trainer/:path*", "/auth/:path*"],
};
