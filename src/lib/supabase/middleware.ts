import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  decideCssdRouteAccess,
  decideLaundryRouteAccess,
} from "@/lib/auth/guards";
import { getProfileRoleForUser } from "@/lib/auth/profile";
import { getPublicEnv } from "@/lib/env";
import { normalizeRole } from "@/lib/auth/roles";

function copyResponseState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  source.headers.forEach((value, key) => {
    if (key.toLowerCase() === "location") {
      return;
    }

    target.headers.set(key, value);
  });
}

export async function updateSession(request: NextRequest) {
  const env = getPublicEnv();

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );

          Object.entries(headers ?? {}).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const role = userId
    ? await getProfileRoleForUser(supabase, userId)
    : normalizeRole(null);

  const cssdDecision = decideCssdRouteAccess({
    pathname: request.nextUrl.pathname,
    role,
    userId,
  });
  const decision = cssdDecision.allowed
    ? decideLaundryRouteAccess({
        pathname: request.nextUrl.pathname,
        role,
        userId,
      })
    : cssdDecision;

  if (!decision.allowed) {
    const redirectResponse = NextResponse.redirect(
      new URL(decision.redirectTo, request.url)
    );

    copyResponseState(supabaseResponse, redirectResponse);

    return redirectResponse;
  }

  return supabaseResponse;
}
