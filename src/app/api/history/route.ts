import { NextResponse } from "next/server";

// History is now stored client-side in localStorage
// This API endpoint is kept for compatibility but returns empty data

export async function GET() {
  return NextResponse.json([]);
}

export async function DELETE() {
  return NextResponse.json({ success: true });
}
