import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backendApi } from "@/lib/axios";
import { STATISTICS_OPERATIONS } from "@/lib/statistics/api";

const ALLOWED_OPERATIONS = new Set<string>(STATISTICS_OPERATIONS);

// Proxies statistics calculation requests to the Express backend.
// The client cannot reach Express directly (BACKEND_URL is server-only), so this
// route forwards the body to POST /statistics/<operation>.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ operation: string }> },
) {
  const { operation } = await params;

  if (!ALLOWED_OPERATIONS.has(operation)) {
    return NextResponse.json({ message: "Unknown statistics operation" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON request body" }, { status: 400 });
  }

  try {
    const backendResponse = await backendApi.post(`/statistics/${operation}`, body);
    return NextResponse.json(backendResponse.data, { status: backendResponse.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json({ message: "Calculation request timed out" }, { status: 504 });
      }
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
    }
    return NextResponse.json({ message: "Failed to connect to backend" }, { status: 502 });
  }
}
