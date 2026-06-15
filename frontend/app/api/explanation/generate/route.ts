import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backendApi } from "@/lib/axios";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON request body" }, { status: 400 });
  }

  try {
    const backendResponse = await backendApi.post(`/explanation/generate/`, body);
    return NextResponse.json(backendResponse.data, { status: backendResponse.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json({ message: "Explanation generation timed out" }, { status: 504 });
      }
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
    }
    return NextResponse.json({ message: "Failed to connect to backend" }, { status: 502 });
  }
}
