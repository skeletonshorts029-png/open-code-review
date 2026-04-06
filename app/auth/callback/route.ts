import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function getSafeRedirectPath(value: string | null) {
  if (!value) return null;
  return value.startsWith("/") ? value : null;
}

function redirectToLoginWithError(requestUrl: URL, message: string) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", message);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath = getSafeRedirectPath(requestUrl.searchParams.get("redirect"));
  const providerError =
    requestUrl.searchParams.get("error_description") ||
    requestUrl.searchParams.get("error");

  if (providerError) {
    return redirectToLoginWithError(
      requestUrl,
      "Google sign-in could not be completed. Please try again."
    );
  }

  if (!code) {
    return redirectToLoginWithError(
      requestUrl,
      "Google sign-in link was incomplete. Please try again."
    );
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectToLoginWithError(
      requestUrl,
      "Google sign-in expired or could not be completed. Please try again."
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLoginWithError(
      requestUrl,
      "Google sign-in finished, but your session could not be loaded. Please try again."
    );
  }

  const { data: profileRow } = await supabase
    .from("users")
    .select("onboarding_complete")
    .eq("uid", user.id)
    .maybeSingle<{ onboarding_complete: boolean }>();

  const nextPath = profileRow?.onboarding_complete ? redirectPath || "/dashboard" : "/onboarding";
  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
