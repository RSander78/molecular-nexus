export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
  fallbackError = "Anfrage fehlgeschlagen"
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Netzwerkfehler");
  }

  if (!res.ok) {
    let message = fallbackError;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new ApiError(message);
  }

  return (await res.json()) as T;
}

export function errorMessage(error: unknown, fallback = "Netzwerkfehler"): string {
  return error instanceof ApiError ? error.message : fallback;
}
