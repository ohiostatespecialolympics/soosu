import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Custom scheme return URL — add this in Supabase Auth → URL Configuration */
export const NATIVE_AUTH_REDIRECT = "com.jacobtartabini.soosuapp://auth/callback";

export function getAuthRedirectTo(path = "/app") {
  if (Capacitor.isNativePlatform()) return NATIVE_AUTH_REDIRECT;
  return `${window.location.origin}${path}`;
}

function normalizeAuthUrl(url: string) {
  // Custom schemes don't always parse cleanly in URL(); normalize first.
  if (url.startsWith("com.jacobtartabini.soosuapp://")) {
    return url.replace("com.jacobtartabini.soosuapp://", "https://soosu.local/");
  }
  return url;
}

export async function completeAuthFromUrl(url: string) {
  const normalized = normalizeAuthUrl(url);
  const parsed = new URL(normalized);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
  const query = parsed.searchParams;

  const code = query.get("code") || hashParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    try {
      await Browser.close();
    } catch {
      /* browser may already be closed */
    }
    return true;
  }

  const access_token = query.get("access_token") || hashParams.get("access_token");
  const refresh_token = query.get("refresh_token") || hashParams.get("refresh_token");
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    try {
      await Browser.close();
    } catch {
      /* ignore */
    }
    return true;
  }

  return false;
}

let deepLinkListenerAttached = false;

export function attachAuthDeepLinkListener() {
  if (!Capacitor.isNativePlatform() || deepLinkListenerAttached) return;
  deepLinkListenerAttached = true;

  CapApp.addListener("appUrlOpen", async ({ url }) => {
    try {
      await completeAuthFromUrl(url);
    } catch (err) {
      console.error("Auth deep link failed", err);
    }
  });
}

export async function signInWithOAuthProvider(provider: Provider) {
  // Native Apple on iOS: system sheet (correct app name, stays in-app)
  if (provider === "apple" && Capacitor.getPlatform() === "ios") {
    await SocialLogin.initialize({ apple: {} });
    const { result } = await SocialLogin.login({
      provider: "apple",
      options: { scopes: ["email", "name"] },
    });
    if (!result.idToken) throw new Error("Apple did not return an ID token");
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: result.idToken,
    });
    if (error) throw error;
    return;
  }

  const redirectTo = getAuthRedirectTo();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });
  if (error) throw error;

  if (Capacitor.isNativePlatform()) {
    if (!data.url) throw new Error("No OAuth URL returned");
    await Browser.open({ url: data.url, presentationStyle: "popover" });
  }
}
