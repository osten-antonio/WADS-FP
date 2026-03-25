import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const backendResponse = await fetch(`${backendBaseUrl}/users/login`, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
  });

  if (!backendResponse.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await backendResponse.json()) as { sessionToken?: string };
  const sessionToken = payload.sessionToken;
  if (!sessionToken) {
    return NextResponse.json({ error: "Invalid session payload" }, { status: 500 });
  }

  const response = NextResponse.json({ status: "success" });

  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
