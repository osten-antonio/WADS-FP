import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import axios from "axios"
import { backendApi } from "@/lib/axios"

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as { submissionIds?: unknown } | null
  const submissionIds = Array.isArray(body?.submissionIds)
    ? body.submissionIds.filter((id): id is string => typeof id === "string")
    : []

  try {
    const backendResponse = await backendApi.delete(`/user/delete-history`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      data: { submissionIds },
    })

    return NextResponse.json(backendResponse.data, { status: backendResponse.status })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json({ message: "Delete history request timed out" }, { status: 504 });
      }
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
    }
    return NextResponse.json({ message: "Failed to connect to backend", }, { status: 502 });
  }
}
