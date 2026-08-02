import { clearAuthCookiesAtScopes, createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  decideCssdRouteAccess,
  decideLaundryRouteAccess,
} from "@/lib/auth/guards";
import { getProfileRoleForUser } from "@/lib/auth/profile";
import { getPublicEnv } from "@/lib/env";
import { normalizeRole } from "@/lib/auth/roles";
import {
  getSupabaseAuthCookieNamesToClear,
  SUPABASE_AUTH_COOKIE_OPTIONS,
} from "@/lib/supabase/cookies";

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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

function isInvalidRefreshTokenError(error: unknown) {
  return /refresh token/i.test(getErrorMessage(error));
}

export async function updateSession(request: NextRequest) {
  const env = getPublicEnv();

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const incomingCookies = request.cookies.getAll();
  const getAll = () => request.cookies.getAll();
  const setAll = (
    cookiesToSet: {
      name: string;
      value: string;
      options?: Parameters<typeof supabaseResponse.cookies.set>[2];
    }[],
    headers?: Record<string, string>
  ) => {
    cookiesToSet.forEach(({ name, value }) =>
      request.cookies.set(name, value)
    );

    const previousResponse = supabaseResponse;

    supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    copyResponseState(previousResponse, supabaseResponse);

    cookiesToSet.forEach(({ name, value, options }) =>
      supabaseResponse.cookies.set(name, value, options)
    );

    Object.entries(headers ?? {}).forEach(([key, value]) => {
      supabaseResponse.headers.set(key, value);
    });
  };

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll,
        setAll,
      },
    }
  );

  let user = null;
  let error: unknown = null;
  try {
    const res = await supabase.auth.getUser();
    user = res.data.user;
    error = res.error;
  } catch (err) {
    error = err;
  }

  if (!user && isInvalidRefreshTokenError(error)) {
    for (const storageKey of getSupabaseAuthCookieNamesToClear(
      env.NEXT_PUBLIC_SUPABASE_URL
    )) {
      await clearAuthCookiesAtScopes({
        getAll: () => incomingCookies,
        setAll,
        storageKey,
        scopes: [{ path: "/" }],
      });
    }

    // Explicitly force maxAge: 0 on all sb- or auth-token cookies to ensure the browser purges them
    incomingCookies.forEach((c) => {
      if (c.name.startsWith("sb-") || c.name.includes("auth-token")) {
        supabaseResponse.cookies.set(c.name, "", {
          maxAge: 0,
          path: "/",
        });
        try {
          request.cookies.delete(c.name);
        } catch {
          // Ignore request cookie deletion errors
        }
      }
    });
  }

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
