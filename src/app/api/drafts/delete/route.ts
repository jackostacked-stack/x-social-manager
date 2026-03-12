import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

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

    const { error } = await supabaseAdmin
      .from("drafts")
      .delete()
      .eq("id", draftId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while deleting draft." },
      { status: 500 }
    );
  }
}