import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { draftId, scheduled_for } = body;

  await supabaseAdmin
    .from("drafts")
    .update({
      scheduled_for,
    })
    .eq("id", draftId);

  return NextResponse.json({ success: true });
}