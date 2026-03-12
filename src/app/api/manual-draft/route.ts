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

    const { error } = await supabaseAdmin.from("drafts").insert({
      tweet_text,
      status: "approved",
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to create draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}