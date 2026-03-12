import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST() {

  await supabaseAdmin
    .from("drafts")
    .update({
      status: "approved",
      scheduled_for: null
    })
    .eq("status", "scheduled");

  return NextResponse.json({
    success: true
  });

}