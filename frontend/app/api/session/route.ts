import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backendApi } from "@/lib/axios";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await backendApi.post(`/user/login`, {}, {
      headers: {
        Authorization: authorization,
      },
    });

    const sessionToken = backendResponse.data?.sessionToken;
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
  } catch (error) {
    console.log(error)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
