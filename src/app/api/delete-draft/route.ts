import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {

  const body = await req.json();
  const { draftId } = body;

  await supabaseAdmin
    .from("drafts")
    .delete()
    .eq("id", draftId);

  return NextResponse.json({
    success: true
  });

}