import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { supabaseAdmin, getActiveAccount } from "@/lib/activeAccount";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const activeAccount = await getActiveAccount();
    const formData = await req.formData();

    const fileValue = formData.get("file");
    const draftIdValue = formData.get("draftId");

    if (!(fileValue instanceof File) || typeof draftIdValue !== "string") {
      return NextResponse.json(
        { error: "Missing file or draftId" },
        { status: 400 }
      );
    }

    const file = fileValue;
    const draftId = draftIdValue;

    const draftResult = await supabaseAdmin
      .from("drafts")
      .select("id, account_id")
      .eq("id", draftId)
      .eq("account_id", activeAccount.id)
      .single();

    if (draftResult.error || !draftResult.data) {
      return NextResponse.json(
        { error: "Draft not found for active account" },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extension = "bin";
    if (file.name && file.name.indexOf(".") !== -1) {
      const parts = file.name.split(".");
      const maybeExtension = parts[parts.length - 1];
      if (maybeExtension) {
        extension = maybeExtension;
      }
    }

    const filePath =
      String(activeAccount.id) +
      "/" +
      String(draftId) +
      "-" +
      String(Date.now()) +
      "." +
      extension;

    const uploadResult = await supabaseAdmin.storage
      .from("tweet-media")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error.message },
        { status: 500 }
      );
    }

    const publicUrlResult = supabaseAdmin.storage
      .from("tweet-media")
      .getPublicUrl(filePath);

    const mediaUrl = publicUrlResult.data.publicUrl;
    const mediaType =
      (file.type || "").indexOf("video") === 0 ? "video" : "image";

    const updateResult = await supabaseAdmin
      .from("drafts")
      .update({
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .eq("id", draftId)
      .eq("account_id", activeAccount.id);

    if (updateResult.error) {
      return NextResponse.json(
        { error: updateResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media_url: mediaUrl,
      media_type: mediaType,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to upload media" },
      { status: 500 }
    );
  }
}