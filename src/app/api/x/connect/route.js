import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";

export async function GET() {
  try {
    const appKey = process.env.X_API_KEY;
    const appSecret = process.env.X_API_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!appKey || !appSecret) {
      return NextResponse.json(
        { error: "Missing X_API_KEY or X_API_SECRET" },
        { status: 500 }
      );
    }

    const callbackUrl = `${siteUrl}/api/x/callback`;

    const client = new TwitterApi({
      appKey: appKey,
      appSecret: appSecret,
    });

    const authLink = await client.generateAuthLink(callbackUrl);

    const response = NextResponse.redirect(authLink.url);

    response.cookies.set("x_oauth_token", authLink.oauth_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("x_oauth_token_secret", authLink.oauth_token_secret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err && err.message
            ? err.message
            : "Failed to start X OAuth flow",
      },
      { status: 500 }
    );
  }
}