import { NextResponse, type NextRequest } from "next/server";

import { decideCssdRouteAccess } from "@/lib/auth/guards";
import { normalizeRole } from "@/lib/auth/roles";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const role = normalizeRole(
    request.cookies.get("ncis-role")?.value ?? request.headers.get("x-ncis-role")
  );
  const userId =
    request.cookies.get("ncis-user-id")?.value ??
    request.headers.get("x-ncis-user-id");

  const decision = decideCssdRouteAccess({
    pathname: request.nextUrl.pathname,
    role,
    userId: userId ?? null,
  });

  if (!decision.allowed) {
    return NextResponse.redirect(new URL(decision.redirectTo, request.url));
  }

  return response;
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
