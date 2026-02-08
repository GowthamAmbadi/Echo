import { auth } from "@/lib/auth";

const protectedPaths = ["/dashboard", "/capture", "/query", "/item"];

export default auth((req) => {
  const isProtected = protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
  return undefined;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)"],
};
