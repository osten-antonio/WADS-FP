import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const sessionToken = (await cookies()).get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${backendBaseUrl}/users/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    const isAbortError = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        message: isAbortError
          ? "Profile request timed out"
          : "Failed to connect to backend",
      },
      { status: isAbortError ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await backendResponse.json().catch(() => ({
    message: "Invalid backend response",
  }));

  return NextResponse.json(payload, { status: backendResponse.status });
}
