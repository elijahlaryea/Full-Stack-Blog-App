import { createMiddleware } from "@arcjet/next";
import aj from "./lib/arcjet";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthentication } from "./lib/auth";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|healthz).*)"],
};

const arcjetMiddleware = createMiddleware(aj);

export async function middleware(request) {
  const arcjetResponse = await arcjetMiddleware(request);

  //custom response
  let response = NextResponse.next();

  //protected routes
  const protectedRoutes = ["/"];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route + "/")
  );

  //protecting home page as an authenticated route. Only verified users can access.
  if (isProtectedRoute) {
    const token = (await cookies()).get("token")?.value;
    const user = token ? await verifyAuthentication(token) : null;

    //redirecting user to login page if not authenticated
    if (!user) {
      if (request.nextUrl.pathname !== "/login") {
        const loginUrl = new URL("login", request.url);
        loginUrl.searchParams.set("from", request.nextUrl.pathname);

        response = NextResponse.redirect(loginUrl);
      }
    }
  }

  if (arcjetResponse && arcjetResponse.headers) {
    arcjetResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
  }

  if (arcjetResponse && arcjetResponse.status !== 200) {
    return arcjetResponse;
  }

  return response;
}
