import { NextResponse } from "next/server";

// Team management requires user authentication
// This feature is available in the enterprise version

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  return NextResponse.json(
    { message: "Team-Verwaltung ist in der Enterprise-Version verfügbar" },
    { status: 200 }
  );
}
