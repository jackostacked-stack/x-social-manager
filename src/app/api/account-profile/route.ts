import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";

const twitter = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

const client = twitter.readOnly;

export async function GET() {
  try {
    const me = await client.v2.me({
      "user.fields": ["profile_image_url", "name", "username"],
    });

    return NextResponse.json({
      success: true,
      account: {
        name: me.data.name,
        username: me.data.username,
        avatar_url: me.data.profile_image_url ?? null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.data?.detail ||
          err?.message ||
          "Failed to fetch account profile.",
      },
      { status: 500 }
    );
  }
}