import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scope } = body;

    if (!scope) {
      return NextResponse.json(
        { error: "scope is required." },
        { status: 400 }
      );
    }

    if (scope === "manager") {
      const { error } = await supabaseAdmin
        .from("drafts")
        .delete()
        .eq("status", "pending");

      if (error) {
        return NextResponse.json(
          { error: "Failed to reset manager." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (scope === "queue") {
      const { error } = await supabaseAdmin
        .from("drafts")
        .delete()
        .eq("status", "approved");

      if (error) {
        return NextResponse.json(
          { error: "Failed to reset queue." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid scope." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while resetting drafts." },
      { status: 500 }
    );
  }
}