/**
 * Syncs Google Sign-In iOS Info.plist keys from .env:
 *   VITE_GOOGLE_IOS_CLIENT_ID=xxxxx.apps.googleusercontent.com
 *
 * Writes GIDClientID + reversed URL scheme required by Google Sign-In SDK.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const plistPath = path.join(root, "ios/App/App/Info.plist");

function readEnv(name) {
  if (process.env[name]) return process.env[name].trim();
  if (!fs.existsSync(envPath)) return "";
  const match = fs.readFileSync(envPath, "utf8").match(new RegExp(`^${name}=["']?([^"'\\n]+)["']?`, "m"));
  return match?.[1]?.trim() || "";
}

function toReversedClientId(iosClientId) {
  // 123-abc.apps.googleusercontent.com -> com.googleusercontent.apps.123-abc
  const prefix = iosClientId.replace(/\.apps\.googleusercontent\.com$/, "");
  return `com.googleusercontent.apps.${prefix}`;
}

const iosClientId = readEnv("VITE_GOOGLE_IOS_CLIENT_ID");
if (!iosClientId) {
  console.log("[sync-google-ios] VITE_GOOGLE_IOS_CLIENT_ID not set — skipping Info.plist Google keys");
  process.exit(0);
}

if (!iosClientId.endsWith(".apps.googleusercontent.com")) {
  console.error("[sync-google-ios] VITE_GOOGLE_IOS_CLIENT_ID must end with .apps.googleusercontent.com");
  process.exit(1);
}

let plist = fs.readFileSync(plistPath, "utf8");
const reversed = toReversedClientId(iosClientId);

if (plist.includes("<key>GIDClientID</key>")) {
  plist = plist.replace(
    /<key>GIDClientID<\/key>\s*<string>[^<]*<\/string>/,
    `<key>GIDClientID</key>\n\t<string>${iosClientId}</string>`,
  );
} else {
  plist = plist.replace(
    "</dict>\n</plist>",
    `\t<key>GIDClientID</key>\n\t<string>${iosClientId}</string>\n</dict>\n</plist>`,
  );
}

// Ensure Google reversed client ID is present in URL schemes
if (!plist.includes(reversed)) {
  if (plist.includes("<key>CFBundleURLTypes</key>")) {
    plist = plist.replace(
      /(<key>CFBundleURLSchemes<\/key>\s*<array>\s*<string>com\.jacobtartabini\.soosuapp<\/string>)/,
      `$1\n\t\t\t\t<string>${reversed}</string>`,
    );
  } else {
    plist = plist.replace(
      "</dict>\n</plist>",
      `\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLName</key>
\t\t\t<string>com.jacobtartabini.soosuapp</string>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>com.jacobtartabini.soosuapp</string>
\t\t\t\t<string>${reversed}</string>
\t\t\t</array>
\t\t</dict>
\t</array>
</dict>
</plist>`,
    );
  }
}

fs.writeFileSync(plistPath, plist);
console.log(`[sync-google-ios] Wrote GIDClientID + ${reversed}`);
