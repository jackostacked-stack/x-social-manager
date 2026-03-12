import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json(
        { error: "draftId is required." },
        { status: 400 }
      );
    }

    const { data: tweet, error: fetchError } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (fetchError || !tweet) {
      return NextResponse.json(
        { error: "Tweet not found." },
        { status: 404 }
      );
    }

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

    const { error: updateError } = await supabaseAdmin
      .from("drafts")
      .update({
        status: "posted",
        tweet_id: posted.data.id,
      })
      .eq("id", draftId);

    if (updateError) {
      return NextResponse.json(
        { error: "Tweet posted but database update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tweet_id: posted.data.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.data?.detail ||
          err?.message ||
          "Failed to post tweet now.",
      },
      { status: 500 }
    );
  }
}