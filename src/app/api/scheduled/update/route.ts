import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function localDatetimeToUTC(value: string) {
  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId, scheduled_for } = body;

    if (!draftId || !scheduled_for) {
      return NextResponse.json(
        { error: "draftId and scheduled_for are required." },
        { status: 400 }
      );
    }

    const parsedDate = localDatetimeToUTC(scheduled_for);

    if (!parsedDate) {
      return NextResponse.json(
        { error: "Invalid scheduled_for date." },
        { status: 400 }
      );
    }

    const now = new Date();

    if (parsedDate.getTime() <= now.getTime()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("drafts")
      .update({
        scheduled_for: parsedDate.toISOString(),
        status: "scheduled",
      })
      .eq("id", draftId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update scheduled tweet.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while updating the scheduled time." },
      { status: 500 }
    );
  }
}