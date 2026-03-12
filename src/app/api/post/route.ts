import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";

const twitter = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

const client = twitter.readWrite;

async function uploadMediaFromUrl(url: string, mediaType?: string | null) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to download media from storage.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const mimeType =
    mediaType === "video"
      ? "video/mp4"
      : response.headers.get("content-type") || "image/jpeg";

  const mediaId = await client.v1.uploadMedia(buffer, {
    mimeType,
  });

  return mediaId;
}

async function runPostJob() {
  const now = new Date().toISOString();

  const { data: tweets, error } = await supabaseAdmin
    .from("drafts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_for", now);

  if (error) {
    return { error: error.message };
  }

  if (!tweets || tweets.length === 0) {
    return { success: true, message: "No tweets ready to post." };
  }

  for (const tweet of tweets) {
    let posted;

    if (tweet.media_url) {
      const mediaId = await uploadMediaFromUrl(
        tweet.media_url,
        tweet.media_type
      );

      posted = await client.v2.tweet({
        text: tweet.tweet_text,
        media: {
          media_ids: [mediaId],
        },
      });
    } else {
      posted = await client.v2.tweet({
        text: tweet.tweet_text,
      });
    }

    await supabaseAdmin
      .from("drafts")
      .update({
        status: "posted",
        tweet_id: posted.data.id,
      })
      .eq("id", tweet.id);
  }

  return {
    success: true,
    posted: tweets.length,
  };
}

export async function POST() {
  try {
    const result = await runPostJob();

    if ("error" in result) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.data?.detail ||
          err?.message ||
          "Posting failed.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await runPostJob();

    if ("error" in result) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.data?.detail ||
          err?.message ||
          "Posting failed.",
      },
      { status: 500 }
    );
  }
}