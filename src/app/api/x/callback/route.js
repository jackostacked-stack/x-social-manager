import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {

    const oauthToken = request.nextUrl.searchParams.get("oauth_token");
    const oauthVerifier = request.nextUrl.searchParams.get("oauth_verifier");

    const cookieToken = request.cookies.get("x_oauth_token")?.value;
    const cookieSecret = request.cookies.get("x_oauth_token_secret")?.value;

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.json({ error: "Missing oauth data" }, { status: 400 });
    }

    const client = new TwitterApi({
      appKey: process.env.X_API_KEY,
      appSecret: process.env.X_API_SECRET,
      accessToken: cookieToken,
      accessSecret: cookieSecret
    });

    const login = await client.login(oauthVerifier);

    const loggedClient = login.client;

    const me = await loggedClient.v2.me({
      "user.fields": ["name", "username", "profile_image_url"]
    });

    const user = me.data;

    const username = user.username;
    const displayName = user.name;
    const avatar = user.profile_image_url;
    const userId = user.id;

    const accessToken = login.accessToken;
    const accessSecret = login.accessSecret;

    await supabase.from("accounts").update({ is_active: false });

    const { data: account } = await supabase
      .from("accounts")
      .upsert({
        x_user_id: userId,
        username: username,
        display_name: displayName,
        avatar_url: avatar,
        oauth_token: accessToken,
        oauth_token_secret: accessSecret,
        is_active: true
      }, { onConflict: "x_user_id" })
      .select()
      .single();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = NextResponse.redirect(siteUrl + "/queue");

    response.cookies.delete("x_oauth_token");
    response.cookies.delete("x_oauth_token_secret");

    response.cookies.set("active_account_id", account.id, {
      path: "/"
    });

    return response;

  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "OAuth callback failed" },
      { status: 500 }
    );
  }
}