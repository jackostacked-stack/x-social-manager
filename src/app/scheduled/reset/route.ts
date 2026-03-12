import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { error } = await supabaseAdmin
      .from("drafts")
      .delete()
      .eq("status", "scheduled");

    if (error) {
      return NextResponse.json(
        { error: "Failed to reset scheduled tweets.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while resetting scheduled tweets." },
      { status: 500 }
    );
  }
}