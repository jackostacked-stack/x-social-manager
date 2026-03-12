import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const draftId = formData.get("draftId") as string | null;

    if (!file || !draftId) {
      return NextResponse.json(
        { error: "file and draftId are required." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "-");
    const filePath = `${draftId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("tweet-media")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file.", details: uploadError.message },
        { status: 500 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("tweet-media")
      .getPublicUrl(filePath);

    const mediaType = file.type.startsWith("video") ? "video" : "image";

    const { error: updateError } = await supabaseAdmin
      .from("drafts")
      .update({
        media_url: data.publicUrl,
        media_type: mediaType,
      })
      .eq("id", draftId);

    if (updateError) {
      return NextResponse.json(
        { error: "File uploaded but failed to save to draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media_url: data.publicUrl,
      media_type: mediaType,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while uploading media." },
      { status: 500 }
    );
  }
}