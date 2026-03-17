import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function DELETE(req: NextRequest) {
  const sessionToken = (await cookies()).get("session")?.value
  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as { submissionIds?: unknown } | null
  const submissionIds = Array.isArray(body?.submissionIds)
    ? body.submissionIds.filter((id): id is string => typeof id === "string")
    : []

  const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:8000"
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  let backendResponse: Response

  try {
    backendResponse = await fetch(`${backendBaseUrl}/users/delete-history`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissionIds }),
      signal: controller.signal,
    })
  } catch (error) {
    const isAbortError = error instanceof Error && error.name === "AbortError"
    return NextResponse.json(
      {
        message: isAbortError ? "Delete history request timed out" : "Failed to connect to backend",
      },
      { status: isAbortError ? 504 : 502 },
    )
  } finally {
    clearTimeout(timeoutId)
  }

  const payload = await backendResponse.json().catch(() => ({
    message: "Invalid backend response",
  }))

  return NextResponse.json(payload, { status: backendResponse.status })
}
