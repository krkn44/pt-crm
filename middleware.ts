import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isClientPage = req.nextUrl.pathname.startsWith("/client");
    const isTrainerPage = req.nextUrl.pathname.startsWith("/trainer");

    if (isAuthPage) {
      if (isAuth) {
        // Se l'utente è già autenticato e prova ad accedere alla pagina di login,
        // reindirizzalo alla sua dashboard
        if (token.role === "TRAINER") {
          return NextResponse.redirect(new URL("/trainer/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/client/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!isAuth) {
      // Se non è autenticato e prova ad accedere a pagine protette
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Protezione route basata sul ruolo
    if (isClientPage && token.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/trainer/dashboard", req.url));
    }

    if (isTrainerPage && token.role !== "TRAINER") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Gestiamo l'autorizzazione nel middleware sopra
    },
  }
);

export const config = {
  matcher: ["/client/:path*", "/trainer/:path*", "/auth/:path*"],
};
