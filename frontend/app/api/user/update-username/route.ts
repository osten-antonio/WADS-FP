import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { backendApi } from "@/lib/axios";

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.displayName !== "string") {
    return NextResponse.json({ message: "displayName is required" }, { status: 400 });
  }

  try {
    const backendResponse = await backendApi.patch(`/user/update-username`, {
      displayName: body.displayName,
    }, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    return NextResponse.json(backendResponse.data, { status: backendResponse.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json({ message: "Update username request timed out" }, { status: 504 });
      }
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
    }
    return NextResponse.json({ message: "Failed to connect to backend" }, { status: 502 });
  }
}
