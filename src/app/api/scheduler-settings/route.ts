import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("scheduler_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

export async function POST(req: NextRequest) {
  try {
    const { min_delay, max_delay } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("scheduler_settings")
      .update({
        min_delay_minutes: min_delay,
        max_delay_minutes: max_delay,
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}