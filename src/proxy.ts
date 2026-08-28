import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  const expectedUser = process.env.KEIRIN_BASIC_USER;
  const expectedPassword = process.env.KEIRIN_BASIC_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return new NextResponse("競輪画面の非公開アクセス設定が未完了です。", { status: 503 });
  }
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Basic ")) {
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(":");
      const user = decoded.slice(0, separator);
      const password = decoded.slice(separator + 1);
      if (separator >= 0 && user === expectedUser && password === expectedPassword) return NextResponse.next();
    } catch { /* malformed Authorization */ }
  }
  return new NextResponse("認証が必要です。", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Private Keirin Dashboard", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/keirin/:path*", "/api/keirin/dashboard/:path*", "/api/keirin/comments/:path*"],
};
