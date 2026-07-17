import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type RouteHandler = (request: Request) => Promise<Response>;

export function withErrorHandling(
  label: string,
  fallbackMessage: string,
  handler: RouteHandler
): RouteHandler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error(`${label}:`, error);
      return jsonError(fallbackMessage, 500);
    }
  };
}
