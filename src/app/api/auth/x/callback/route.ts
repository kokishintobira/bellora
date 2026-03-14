import { NextRequest, NextResponse } from "next/server";
import { getXPkceState, deleteXPkceState, saveXTokens } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";

const CLIENT_ID = process.env.X_POST_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.X_POST_CLIENT_SECRET ?? "";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return new NextResponse(htmlPage("Error", "Missing code or state parameter."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Load and validate PKCE state
  const pkce = await getXPkceState();
  if (!pkce) {
    return new NextResponse(htmlPage("Error", "No pending authorization found. Start again from /api/auth/x."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (pkce.state !== state) {
    await deleteXPkceState();
    return new NextResponse(htmlPage("Error", "State mismatch — possible CSRF. Please retry."), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // PKCE state expires after 10 minutes
  if (Date.now() - pkce.createdAt > 10 * 60 * 1000) {
    await deleteXPkceState();
    return new NextResponse(htmlPage("Error", "Authorization timed out. Please retry."), {
      status: 408,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const redirectUri = `${SITE_URL}/api/auth/x/callback`;

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: pkce.codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    await deleteXPkceState();
    return new NextResponse(htmlPage("Token Exchange Failed", `X API returned ${tokenRes.status}: ${body}`), {
      status: 502,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const json = await tokenRes.json();

  // Persist tokens
  await saveXTokens({
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  });

  // Clean up PKCE state
  await deleteXPkceState();

  return new NextResponse(htmlPage("Authorization Complete", "X OAuth tokens saved successfully. You can close this tab."), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><title>${title} - Bellora</title>
<style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0B0F1A;color:#e2e8f0}
.card{background:#1a1f2e;padding:2rem 3rem;border-radius:12px;text-align:center;max-width:480px}
h1{margin:0 0 1rem;font-size:1.5rem}p{margin:0;color:#94a3b8}</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body>
</html>`;
}
