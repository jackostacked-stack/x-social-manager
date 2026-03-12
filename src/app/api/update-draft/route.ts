import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId, tweet_text } = body;

    if (!draftId || !tweet_text) {
      return NextResponse.json(
        { error: "draftId and tweet_text are required." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("drafts")
      .update({ tweet_text })
      .eq("id", draftId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update draft.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while updating the draft." },
      { status: 500 }
    );
  }
}