import { NextResponse } from "next/server";
import { sanitizeClientEvent } from "@/lib/client-events";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const event = sanitizeClientEvent(payload);
  if (!event) {
    return NextResponse.json({ success: false, error: "invalid_client_event" }, { status: 400 });
  }

  console.info("client_event", event);
  return NextResponse.json({ success: true }, { status: 202 });
}
