import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("drafts")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch drafts." },
        { status: 500 }
      );
    }

    return NextResponse.json({ drafts: data });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching drafts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId, status } = body;

    if (!draftId || !status) {
      return NextResponse.json(
        { error: "draftId and status are required." },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be approved or rejected." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("drafts")
      .update({ status })
      .eq("id", draftId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update draft.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while updating draft." },
      { status: 500 }
    );
  }
}