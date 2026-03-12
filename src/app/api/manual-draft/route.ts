import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tweet_text } = body;

    if (!tweet_text) {
      return NextResponse.json(
        { error: "tweet_text is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("drafts")
      .insert({
        tweet_text,
        status: "approved",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create draft", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}