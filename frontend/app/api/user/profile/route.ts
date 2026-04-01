import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { backendApi } from "@/lib/axios";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await backendApi.get(`/user/profile`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    return NextResponse.json(backendResponse.data, { status: backendResponse.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json({ message: "Profile request timed out" }, { status: 504 });
      }
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
    }
    return NextResponse.json({ message: "Failed to connect to backend" }, { status: 502 });
  }
}
