import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { saveXPkceState } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

const CLIENT_ID = process.env.X_POST_CLIENT_ID ?? "";
const API_SECRET = process.env.API_SECRET ?? "";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET(req: NextRequest) {
  // Authenticate via query param (browser GET — can't use headers)
  const secret = req.nextUrl.searchParams.get("secret");
  if (!API_SECRET || secret !== API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!CLIENT_ID) {
    return NextResponse.json({ error: "X_POST_CLIENT_ID not configured" }, { status: 500 });
  }

  // Generate PKCE code_verifier (43-128 chars, base64url)
  const codeVerifier = base64url(crypto.randomBytes(32));
  // code_challenge = base64url(SHA-256(code_verifier))
  const codeChallenge = base64url(crypto.createHash("sha256").update(codeVerifier).digest());
  // State for CSRF protection
  const state = base64url(crypto.randomBytes(16));

  // Persist PKCE state for the callback
  await saveXPkceState({
    codeVerifier,
    state,
    createdAt: Date.now(),
  });

  const redirectUri = `${SITE_URL}/api/auth/x/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
}
