import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Custom scheme return URL — add this in Supabase Auth → URL Configuration */
export const NATIVE_AUTH_REDIRECT = "com.jacobtartabini.soosuapp://auth/callback";

const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined;
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined;

export function getAuthRedirectTo(path = "/app") {
  if (Capacitor.isNativePlatform()) return NATIVE_AUTH_REDIRECT;
  return `${window.location.origin}${path}`;
}

function normalizeAuthUrl(url: string) {
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

function getUrlSafeNonce() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(message: string) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function getNoncePair() {
  const rawNonce = getUrlSafeNonce();
  const nonceDigest = await sha256Hex(rawNonce);
  return { rawNonce, nonceDigest };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function signInWithNativeGoogle(retry = false): Promise<void> {
  const platform = Capacitor.getPlatform();
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      "Missing VITE_GOOGLE_WEB_CLIENT_ID. Add your Google Web OAuth client ID to .env",
    );
  }
  if (platform === "ios" && !GOOGLE_IOS_CLIENT_ID) {
    throw new Error(
      "Missing VITE_GOOGLE_IOS_CLIENT_ID. Add your Google iOS OAuth client ID to .env",
    );
  }

  const { rawNonce, nonceDigest } = await getNoncePair();

  await SocialLogin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      mode: "online",
      ...(platform === "ios"
        ? {
            iOSClientId: GOOGLE_IOS_CLIENT_ID,
            // Makes idToken audience = web client ID (what Supabase expects)
            iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
          }
        : {}),
    },
  });

  const { result } = await SocialLogin.login({
    provider: "google",
    options: {
      scopes: ["email", "profile"],
      nonce: nonceDigest,
    },
  });

  if (result.responseType !== "online" || !("idToken" in result) || !result.idToken) {
    throw new Error("Google did not return an ID token");
  }

  const payload = decodeJwtPayload(result.idToken);
  if (payload?.nonce && payload.nonce !== nonceDigest) {
    if (!retry) {
      try {
        await SocialLogin.logout({ provider: "google" });
      } catch {
        /* ignore */
      }
      return signInWithNativeGoogle(true);
    }
    throw new Error("Google sign-in nonce mismatch. Please try again.");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: result.idToken,
    ...(payload?.nonce ? { nonce: rawNonce } : {}),
  });
  if (error) throw error;
}

async function signInWithNativeApple() {
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
}

export async function signInWithOAuthProvider(provider: Provider) {
  if (provider === "apple" && Capacitor.getPlatform() === "ios") {
    await signInWithNativeApple();
    return;
  }

  if (provider === "google" && Capacitor.isNativePlatform()) {
    await signInWithNativeGoogle();
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
